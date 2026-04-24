type PhoneAuthStep = 'phone' | 'code' | 'success';

type ClerkErrorLike = {
  errors?: Array<{ message?: string; code?: string }>;
  message?: string;
  data?: { message?: string };
};

type PhoneVerificationResponse = {
  token?: string;
  user?: unknown;
};

export const usePhoneAuth = () => {
  const userStore = useUserStore();
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();

  const step = ref<PhoneAuthStep>('phone');
  const countryCode = ref('+7');
  const phoneNumber = ref('');
  const verificationCode = ref('');
  const verificationId = ref<string | null>(null);

  const isLoading = ref(false);
  const error = ref('');

  // Флаг, который показывает, в каком режиме мы сейчас
  const isSignUpMode = ref(false);

  const fullPhone = computed(() => {
    const digits = phoneNumber.value.replace(/\D/g, '');
    return `${countryCode.value}${digits}`;
  });

  const uniqueLogin = computed(() => {
    const digits = fullPhone.value.replace(/\D/g, '');
    return `user${digits}`;
  });

  const getErrorMessage = (err: unknown, fallback: string) => {
    const e = err as ClerkErrorLike | undefined;
    // Особо обрабатываем ошибку "пользователь не найден"
    if (e?.errors?.[0]?.code === 'form_identifier_not_found') {
      return 'Пользователь не найден. Будет создан новый аккаунт.';
    }
    return (
      e?.errors?.[0]?.message || e?.data?.message || e?.message || fallback
    );
  };

  // Отправка кода (с определением: sign-in или sign-up)
  const sendVerificationCode = async () => {
    error.value = '';
    isSignUpMode.value = false;

    if (!isSignInLoaded.value || !signIn.value) {
      error.value = 'Clerk ещё загружается';
      return;
    }

    const digits = phoneNumber.value.replace(/\D/g, '');
    if (digits.length < 6) {
      error.value = 'Введите корректный номер телефона';
      return;
    }

    isLoading.value = true;

    console.log('fullPhone.value', fullPhone.value);
    try {
      // Шаг 1: Пробуем sign-in
      const result = await signIn.value.create({
        strategy: 'phone_code',
        identifier: fullPhone.value,
      });

      // Если успешно — пользователь существует
      verificationId.value = result.id;
      step.value = 'code';
    } catch (err) {
      const clerkErr = err as ClerkErrorLike;
      const notFoundError = clerkErr?.errors?.find(
        (e) => e.code === 'form_identifier_not_found',
      );

      if (notFoundError) {
        // Пользователь не найден — переключаемся на регистрацию
        await handleSignUp();
      } else {
        error.value = getErrorMessage(err, 'Не удалось отправить код');
      }
    } finally {
      isLoading.value = false;
    }
  };

  // Регистрация нового пользователя
  const handleSignUp = async () => {
    if (!isSignUpLoaded.value || !signUp.value) {
      error.value = 'Clerk (signUp) ещё загружается';
      return;
    }

    try {
      // Создаём пользователя с телефоном
      const result = await signUp.value.create({
        phoneNumber: fullPhone.value,
      });

      // Отправляем SMS с кодом
      const prepareResult = await signUp.value.preparePhoneNumberVerification();

      verificationId.value = result.id;
      isSignUpMode.value = true;
      step.value = 'code';
    } catch (err) {
      error.value = getErrorMessage(err, 'Не удалось начать регистрацию');
      throw err;
    }
  };

  // Верификация кода (универсальная)
  const verifyCode = async () => {
    error.value = '';

    const code = verificationCode.value.trim();
    if (code.length < 4) {
      error.value = 'Введите код из SMS';
      return;
    }

    isLoading.value = true;

    try {
      let attempt;

      if (isSignUpMode.value) {
        // Режим регистрации
        if (!isSignUpLoaded.value || !signUp.value) {
          error.value = 'Clerk ещё загружается';
          return;
        }

        if (!verificationId.value) {
          error.value = 'Не найдена сессия регистрации';
          return;
        }

        // Пробуем верифицировать код для sign-up
        attempt = await signUp.value.attemptPhoneNumberVerification({
          code,
        });

        if (attempt.status !== 'complete') {
          error.value = 'Код не подтверждён';
          return;
        }

        // ФИНАЛИЗАЦИЯ: создаём пользователя
        const completeSignUp = await signUp.value.finalize();

        if (completeSignUp.createdSessionId) {
          // Устанавливаем активную сессию
          await setActive({ session: completeSignUp.createdSessionId });
        }
      } else {
        // Режим входа существующего пользователя
        if (!isSignInLoaded.value || !signIn.value) {
          error.value = 'Clerk ещё загружается';
          return;
        }

        if (!verificationId.value) {
          error.value = 'Не найдена сессия входа';
          return;
        }

        attempt = await signIn.value.attempt({
          strategy: 'phone_code',
          code,
        });

        if (attempt.status !== 'complete') {
          error.value = 'Код не подтверждён';
          return;
        }
      }

      // После успешной аутентификации — ваш бэкенд
      const config = useRuntimeConfig();

      const data = await $fetch<PhoneVerificationResponse>(
        `${config.public.apiBase}/auth/phone-verification`,
        {
          method: 'POST',
          body: {
            phoneNumber: fullPhone.value,
            login: uniqueLogin.value,
          },
        },
      );

      if (data?.token) {
        userStore.token = data.token;
        localStorage.setItem('authToken', data.token);
      }

      if (data?.user) {
        userStore.setCurrentUser(data.user);
      } else {
        await userStore.fetchMe();
      }

      step.value = 'success';
      await navigateTo('/profile');
    } catch (err) {
      console.error('Verification error:', err);
      error.value = getErrorMessage(err, 'Не удалось завершить авторизацию');
    } finally {
      isLoading.value = false;
    }
  };

  const resetForm = () => {
    step.value = 'phone';
    phoneNumber.value = '';
    verificationCode.value = '';
    verificationId.value = null;
    error.value = '';
    isLoading.value = false;
    isSignUpMode.value = false;
  };

  return {
    isLoaded: () => isSignInLoaded.value && isSignUpLoaded.value,
    step,
    countryCode,
    phoneNumber,
    verificationCode,
    verificationId,
    isLoading,
    error,
    fullPhone,
    uniqueLogin,
    sendVerificationCode,
    verifyCode,
    resetForm,
  };
};
