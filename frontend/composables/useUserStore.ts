import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as any,
    users: [] as any[],
    loading: false,
    is_resetting: false,
    error: null as string | null,
    token: null as string | null,
  }),
  actions: {
    // Auth endpoints
    async signUp(
      login: string,
      password: string,
      username?: string,
      referralCode?: string,
    ) {
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const data = await $fetch(`${config.public.apiBase}/auth/sign-up`, {
          method: 'POST',
          body: { login, password, referralCode },
        });
        this.error = null;
        return data;
      } catch (err) {
        this.error = err.data?.message || err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Регистрация через телефон
    async registerByPhone(login, password, username?, phoneNumber) {
      this.loading = true;
      this.error = null;

      try {
        const data = await $fetch(`${config.public.apiBase}/auth/sign-up`, {
          method: 'POST',
          body: { login, password },
        });
        console.log('phoneNumber registration flow. Data: ', data);

        await this.fetchMe(); // для того что бы currentUser заполнился data
        const payloadData = { contacts: { phone: phoneNumber } };
        await this.updateCurrentAccount(payloadData);
        return data;
      } catch (err) {
        // Если пользователь уже существует - это не ошибка
        if (
          err.statusCode === 400 &&
          err.data?.message?.includes('already exists')
        ) {
          return { success: true, exists: true };
        }
        error.value = err.data?.message || 'Registration failed';
        return { success: false, error: error.value };
      } finally {
        loading.value = false;
      }
    },

    async login(login: string, password: string) {
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const data: any = await $fetch(`${config.public.apiBase}/auth/login`, {
          method: 'POST',
          body: { login, password },
        });
        this.token = data.token;
        localStorage.setItem('authToken', data.token);
        this.error = null;
        return data;
      } catch (err) {
        this.error = err.data?.message || err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try {
        const config = useRuntimeConfig();
        const token = localStorage.getItem('authToken');
        await $fetch(`${config.public.apiBase}/auth/logout`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('authToken');
        navigateTo('/');
      }
    },
    async fetchMe() {
      try {
        const config = useRuntimeConfig();
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No token');
        const data = await $fetch(`${config.public.apiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.currentUser = data;
        this.error = null;
        return data;
      } catch (err) {
        this.error = err.data?.message || err.message;
        this.currentUser = null;
        throw err;
      }
    },
    async fetchUsers(query = '') {
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const data = await $fetch(
          `${config.public.apiBase}/users${query ? `?q=${query}` : ''}`,
        );
        this.users = data as any[];
        this.error = null;
      } catch (err) {
        this.error = err.data?.message || err.message;
      } finally {
        this.loading = false;
      }
    },
    async fetchUserById(id: string | number) {
      try {
        const config = useRuntimeConfig();
        const userId = typeof id === 'number' ? id : parseInt(id, 10);
        if (isNaN(userId)) throw new Error('Invalid user ID');

        return await $fetch(`${config.public.apiBase}/users/${userId}`);
      } catch (err) {
        this.error = err.data?.message || err.message;
        throw err;
      }
    },
    async addUser(name: string, firstName: string, contacts?: any) {
      try {
        const config = useRuntimeConfig();
        return await $fetch(`${config.public.apiBase}/users`, {
          method: 'POST',
          body: { name, firstName, contacts },
        });
      } catch (err) {
        this.error = err.data?.message || err.message;
        throw err;
      }
    },
    async mockVer(id: string) {
      try {
        const config = useRuntimeConfig();
        const mockData = {
          avatar: null,
          bio: null,
          reputation_score: 0,
          deals_count: 0,
          positive_feedback_percent: 0,
          verifications: {
            fullName: {
              lastName: 'Klimov',
              firstName: 'Roman',
              patronymic: '',
            },
            passport: {
              series: '1231',
              number: '123123',
              dateOfIssue: '2025-07-18',
              issuedBy: 'qweqweqwe',
              photo:
                'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA8ADwAAD/4RSgRXhpZgAATU0AKgAAAAgACQEPAAIAAAAGAAAAegEQAAIAAAAPAAAAgAESAAMAAAABAAEAAAEaAAUAAAABAAAAkAEbAAUAAAABAAAAmAEoAAMAAAABAAIAAAExAAIAAAAxAAAAoAEyAAIAAAAUAAAA0odpAAQAAAABAAAA5gAAAyZDYW5vbgBDYW5vbiBFT1MgNjAwRAAAAAAA8AAAAAEAAADwAAAAAUFkb2JlIFBob3Rvc2hvcCBMaWdodHJvb20gQ2xhc3NpYyAxMi4zIChXaW5kb3dzKQAAMjAyNDowOToxNSAwMDozMTowNwAAH4KaAAUAAAABAAACYIKdAAUAAAABAAACaIgiAAMAAAABAAEAAIgnAAMAAAABAGQAAIg',
            },
            contacts: {
              email: 'gingerale.pp@gmail.com',
              phone: '123123123',
              countryCode: '+7',
              telegram: 'dsfdsfsd',
            },
            verifiedAt: '2026-04-23T21:20:36.846Z',
            status: 'pending',
          },
        };
        const id = this.currentUser.account.id;
        return await $fetch(`${config.public.apiBase}/users/${id}`, {
          method: 'POST',
          body: mockData,
        });
      } catch (err) {
        this.error = err.data?.message || err.message;
        throw err;
      }
    },
    async updateCurrentAccount(data: Object) {
      try {
        const id = this.currentUser.account.id;
        const config = useRuntimeConfig();
        // const login = this.currentUser.user.login;

        // Маппинг в модель Account
        const payload = {
          // id: userId,
          // username: login || 'user',
          avatar: null,
          bio: null,
          reputation_score: 0.0,
          deals_count: 0,
          positive_feedback_percent: 0,
          verifications: {
            fullName: data.fullName,
            passport: data.passport,
            contacts: data.contacts,
            verifiedAt: new Date().toISOString(),
            status: 'verified', // или 'pending'
          },
        };

        return await $fetch(`${config.public.apiBase}/users/${id}`, {
          method: 'POST',
          body: payload,
        });
      } catch (err) {
        this.error = err.data?.message || err.message;
        throw err;
      }
    },
    async activateAccount(id: string) {
      try {
        const config = useRuntimeConfig();
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No token');
        return await $fetch(`${config.public.apiBase}/auth/activate/${id}`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch (err) {
        this.error = err.data?.message || err.message;
        throw err;
      }
    },

    async resetDatabase() {
      this.is_resetting = true;
      try {
        const config = useRuntimeConfig();
        return await $fetch(`${config.public.apiBase}/reset`, {
          method: 'POST',
        });
      } catch (err) {
        this.error = err.data?.message || err.message;
        throw err;
      } finally {
        this.is_resetting = false;
      }
    },
    setCurrentUser(user: any) {
      this.currentUser = user;
    },
  },
});
