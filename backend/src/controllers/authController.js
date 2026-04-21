
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
    readUsers,
    writeUsers,
    addToBlacklist,
} from '../../file_db/utils/file-handlers.js';

const signUp = async (req, res) => {
    try {
        console.log('📝 Sign Up запрос:', req.body);

        const { username, password } = req.body;

        // Валидация
        if (!username || !password) {
            return res.status(400).json({
                message: 'Поля обязательны: username, password'
            });
        }

        // Простая валидация username
        //  `^`             — начало строки.
        //  `[a-zA-Z0-9_-]` — разрешены латинские буквы, цифры, подчёркивание и дефис.
        //  `{3,20}`        — длина от 3 до 20 символов.
        //  `$`             — конец строки.

        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                message: 'Неверный формат username'
            });
        }

        const users = await readUsers();

        // Проверка существования пользователя
        if (users.find(user => user.username === username)) {
            return res.status(409).json({
                message: 'Пользователь с таким username уже существует'
            });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя
        const newUser = {
            id: Date.now(),
            username,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        users.push(newUser);
        await writeUsers(users);

        console.log(`✅ Пользователь создан: ${username}`);

        res.status(201).json({
            username: newUser.username,
        });
    } catch (error) {
        console.error('❌ Ошибка Sign Up:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера'
        });
    }
};

const login = async (req, res) => {
    try {
        console.log('🔐 Sign In запрос для:', req.body.username);

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'username и password обязательны'
            });
        }

        const users = await readUsers();
        const user = users.find(user => user.username === username);

        if (!user) {
            console.log('❌ Пользователь не найден:', username);
            return res.status(401).json({
                message: 'Неверный username или пароль'
            });
        }

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('❌ Неверный пароль для:', username);
            return res.status(401).json({
                message: 'Неверный username или пароль'
            });
        }

        // Генерация JWT токена
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log(`✅ Успешный вход: ${username}`);

        res.json({
            token,
            username: user.username,
        });
    } catch (error) {
        console.error('❌ Ошибка Sign In:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера'
        });
    }
};

const logout = async (req, res) => {
    try {
        const token = req.headers.authorization.replace('Bearer ', '');

        // Добавляем токен в blacklist
        await addToBlacklist(token);

        console.log(`🚪 Пользователь ${req.user.username} вышел из системы`);

        res.status(204)
    } catch (error) {
        console.error('❌ Ошибка Sign Out:', error);
        res.status(500).json({
            message: 'Внутренняя ошибка сервера'
        });
    }
};

const me = async (req, res) => {
    try {
        const users = await readUsers();
        const user = users.find(u => u.id === req.user.id);

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден'
            });
        }

        res.json({
            username: user.username,
        });

    } catch (error) {
        console.error('❌ Ошибка получения профиля:', error);
        res.status(500).json({
            message: 'Неизвестная ошибка при получении профиля'
        });
    }
};

export default {
    me,
    signUp,
    login,
    logout,
};
