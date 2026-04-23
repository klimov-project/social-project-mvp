
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { validateSignUp, validateLogin } from '../utils/validation.js';
import { addToBlacklist } from '../middleware/auth.js';

const prisma = new PrismaClient();

const signUp = async (req, res) => {
    try {
        console.log('📝 Sign Up request:', req.body);

        const { login, password, username = login, referralCode } = req.body;

        // Validation
        validateSignUp({ login, password, username, referralCode });

        // Check uniqueness
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { login },
                    { account: { username } }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'Login or username already exists'
            });
        }

        let refer_id = null;
        if (referralCode) {
            const referrer = await prisma.user.findUnique({
                where: { login: referralCode }
            });
            if (!referrer || !referrer.is_active) {
                return res.status(400).json({
                    message: 'Invalid referral code'
                });
            }
            refer_id = referrer.id;
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user and account in transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    login,
                    password_hash,
                    refer_id,
                    is_active: false
                }
            });

            const account = await tx.account.create({
                data: {
                    id: user.id,
                    username,
                    verifications: {
                        email: { value: null, verified: false, verified_at: null },
                        phone: { value: null, verified: false, verified_at: null },
                        telegram: { username: null, verified: false, verified_at: null },
                        google: { email: null, verified: false, verified_at: null },
                        apple: { id: null, verified: false, verified_at: null },
                        facebook: { id: null, verified: false, verified_at: null },
                        instagram: { username: null, verified: false, verified_at: null },
                        linkedin: { id: null, verified: false, verified_at: null },
                        twitter: { username: null, verified: false, verified_at: null },
                        whatsapp: { phone: null, verified: false, verified_at: null }
                    }
                }
            });

            return { user, account };
        });

        console.log(`✅ User created: ${login}`);

        res.status(201).json({
            username: result.account.username
        });
    } catch (error) {
        console.error('❌ Sign Up error:', error);
        if (error.message.includes('must be') || error.message.includes('Invalid')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const login = async (req, res) => {
    try {
        console.log('🔐 Login request for:', req.body.login);

        const { login, password } = req.body;

        // Validation
        validateLogin({ login, password });

        const user = await prisma.user.findUnique({
            where: { login },
            include: { account: true }
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid login or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid login or password'
            });
        }

        // Check is_active
        if (!user.is_active) {
            return res.status(403).json({
                message: 'Account not activated. Your account is awaiting moderator approval or you need complete verification or you need to get a referral.'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log(`✅ Successful login: ${login}`);

        res.json({
            token,
            username: user.account.username
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const logout = async (req, res) => {
    try {
        const authHeader = req.header('Authorization');
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            addToBlacklist(token);
        }

        console.log(`🚪 User logged out`);

        res.status(204).send();
    } catch (error) {
        console.error('❌ Logout error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const me = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { account: true }
        });

        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }

        res.json({
            user: {
                id: user.id,
                login: user.login,
                role: user.role,
                refer_id: user.refer_id,
                is_active: user.is_active
            },
            account: {
                id: user.account.id,
                username: user.account.username,
                avatar: user.account.avatar,
                bio: user.account.bio,
                reputation_score: user.account.reputation_score,
                deals_count: user.account.deals_count,
                positive_feedback_percent: user.account.positive_feedback_percent,
                verifications: user.account.verifications
            }
        });
    } catch (error) {
        console.error('❌ Me error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};

export default {
    signUp,
    login,
    logout,
    me
};
