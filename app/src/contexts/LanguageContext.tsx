import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Language = 'uk' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  uk: {
    // Common
    'app.name': 'Медіа Простір',
    'app.tagline': 'Платформа для дослідження та аналізу телеграм-каналів',
    'app.description': 'Від базової інформації до глибокого досьє — дізнайтесь все про канали, їх власників та зв\'язки',
    
    // Navigation
    'nav.channels': 'Канали',
    'nav.admin': 'Адмін панель',
    'nav.logout': 'Вийти',
    'nav.back': 'Назад',
    'nav.backToChannels': 'Назад до каналів',
    
    // Auth
    'auth.login': 'Вхід',
    'auth.register': 'Реєстрація',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.confirmPassword': 'Підтвердіть пароль',
    'auth.username': 'Ім\'я користувача',
    'auth.secretCode': 'Кодове слово',
    'auth.secretCodeInfo': 'Що це?',
    'auth.noAccount': 'Немає акаунту?',
    'auth.hasAccount': 'Вже є акаунт?',
    'auth.registerBtn': 'Зареєструватися',
    'auth.loginBtn': 'Увійти',
    'auth.securityNote': 'Доступ лише для авторизованих користувачів з кодовим словом',
    
    // Secret codes
    'secret.userTitle': 'Кодове слово',
    'secret.userDesc': 'Для реєстрації на платформі потрібне спеціальне кодове слово. Тип коду визначає рівень доступу до платформи.',
    'secret.userCode': 'User код (звичайний доступ):',
    'secret.adminCode': 'Admin код (повний доступ):',
    'secret.adminFeatures': 'Admin-акаунти можуть створювати та редагувати канали, власників та досьє прямо на сайті.',
    
    // Regions
    'region.allUkraine': 'Вся Україна',
    'region.kharkiv': 'Харків',
    'region.select': 'Виберіть регіон',
    
    // Filters
    'filter.all': 'Всі',
    'filter.categories': 'Категорії:',
    'filter.ratingColors': 'Рейтингові кольори:',
    'filter.search': 'Пошук каналів...',
    
    // Rating colors
    'rating.red': 'Червоний',
    'rating.green': 'Зелений',
    'rating.purple': 'Фіолетовий',
    'rating.select': 'Виберіть рейтинг',
    
    // Channel
    'channel.subscribers': 'Підписників',
    'channel.activity': 'Активність',
    'channel.trust': 'Довіра',
    'channel.category': 'Категорія',
    'channel.rating': 'Рейтинг',
    'channel.edit': 'Редагувати',
    'channel.delete': 'Видалити',
    'channel.save': 'Зберегти',
    'channel.cancel': 'Скасувати',
    
    // Tabs
    'tab.owner': 'Власник',
    'tab.admin': 'Адмін',
    'tab.overview': 'Огляд',
    'tab.addTab': 'Додати вкладку',
    'tab.template': 'Шаблон',
    'tab.template.owner': 'Власник/Адмін',
    'tab.template.overview': 'Огляд',
    
    // Owner/Admin template
    'owner.photo': 'Фото',
    'owner.fullName': 'ПІБ',
    'owner.birthDate': 'Дата народження',
    'owner.birthPlace': 'Місце народження',
    'owner.residence': 'Місце проживання',
    'owner.phone': 'Номер телефону',
    'owner.mediaActivity': 'Характеристика медіа активності',
    'owner.mediaResources': 'Кількість медіа ресурсів',
    'owner.socialNetworks': 'Соціальні мережі',
    'owner.dossier': 'Досьє',
    'owner.uploadDossier': 'Завантажити досьє',
    'owner.addLink': 'Додати посилання',
    'owner.addImage': 'Додати зображення',
    
    // Overview template
    'overview.addBlock': 'Додати блок',
    'overview.blockTitle': 'Заголовок блоку',
    'overview.blockContent': 'Текст блоку',
    'overview.addImage': 'Додати зображення',
    'overview.deleteBlock': 'Видалити блок',
    
    // Admin panel
    'admin.title': 'Панель адміністратора',
    'admin.description': 'Управління каналами, власниками та контентом платформи',
    'admin.channels': 'Канали',
    'admin.owners': 'Власники',
    'admin.addChannel': 'Додати канал',
    'admin.addOwner': 'Додати власника',
    'admin.editDossier': 'Редагувати досьє',
    'admin.stats': 'Статистика',
    
    // Activity levels
    'activity.high': 'Висока',
    'activity.medium': 'Середня',
    'activity.low': 'Низька',
    
    // Messages
    'msg.loginSuccess': 'Успішний вхід!',
    'msg.registerSuccess': 'Реєстрація успішна!',
    'msg.logoutSuccess': 'Ви вийшли з системи',
    'msg.saveSuccess': 'Збережено успішно',
    'msg.deleteSuccess': 'Видалено успішно',
    'msg.error': 'Сталася помилка',
    'msg.invalidCredentials': 'Невірний email або пароль',
    'msg.passwordMismatch': 'Паролі не співпадають',
    'msg.invalidSecret': 'Невірне кодове слово',
  },
  en: {
    // Common
    'app.name': 'Media Space',
    'app.tagline': 'Platform for researching and analyzing Telegram channels',
    'app.description': 'From basic information to in-depth dossiers — learn everything about channels, their owners and connections',
    
    // Navigation
    'nav.channels': 'Channels',
    'nav.admin': 'Admin Panel',
    'nav.logout': 'Logout',
    'nav.back': 'Back',
    'nav.backToChannels': 'Back to channels',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm password',
    'auth.username': 'Username',
    'auth.secretCode': 'Secret code',
    'auth.secretCodeInfo': 'What is this?',
    'auth.noAccount': 'No account?',
    'auth.hasAccount': 'Already have an account?',
    'auth.registerBtn': 'Register',
    'auth.loginBtn': 'Login',
    'auth.securityNote': 'Access only for authorized users with secret code',
    
    // Secret codes
    'secret.userTitle': 'Secret Code',
    'secret.userDesc': 'A special secret code is required for registration. The code type determines the access level to the platform.',
    'secret.userCode': 'User code (regular access):',
    'secret.adminCode': 'Admin code (full access):',
    'secret.adminFeatures': 'Admin accounts can create and edit channels, owners and dossiers directly on the site.',
    
    // Regions
    'region.allUkraine': 'All Ukraine',
    'region.kharkiv': 'Kharkiv',
    'region.select': 'Select region',
    
    // Filters
    'filter.all': 'All',
    'filter.categories': 'Categories:',
    'filter.ratingColors': 'Rating colors:',
    'filter.search': 'Search channels...',
    
    // Rating colors
    'rating.red': 'Red',
    'rating.green': 'Green',
    'rating.purple': 'Purple',
    'rating.select': 'Select rating',
    
    // Channel
    'channel.subscribers': 'Subscribers',
    'channel.activity': 'Activity',
    'channel.trust': 'Trust',
    'channel.category': 'Category',
    'channel.rating': 'Rating',
    'channel.edit': 'Edit',
    'channel.delete': 'Delete',
    'channel.save': 'Save',
    'channel.cancel': 'Cancel',
    
    // Tabs
    'tab.owner': 'Owner',
    'tab.admin': 'Admin',
    'tab.overview': 'Overview',
    'tab.addTab': 'Add tab',
    'tab.template': 'Template',
    'tab.template.owner': 'Owner/Admin',
    'tab.template.overview': 'Overview',
    
    // Owner/Admin template
    'owner.photo': 'Photo',
    'owner.fullName': 'Full name',
    'owner.birthDate': 'Birth date',
    'owner.birthPlace': 'Birth place',
    'owner.residence': 'Residence',
    'owner.phone': 'Phone number',
    'owner.mediaActivity': 'Media activity characteristics',
    'owner.mediaResources': 'Number of media resources',
    'owner.socialNetworks': 'Social networks',
    'owner.dossier': 'Dossier',
    'owner.uploadDossier': 'Upload dossier',
    'owner.addLink': 'Add link',
    'owner.addImage': 'Add image',
    
    // Overview template
    'overview.addBlock': 'Add block',
    'overview.blockTitle': 'Block title',
    'overview.blockContent': 'Block content',
    'overview.addImage': 'Add image',
    'overview.deleteBlock': 'Delete block',
    
    // Admin panel
    'admin.title': 'Admin Panel',
    'admin.description': 'Manage channels, owners and platform content',
    'admin.channels': 'Channels',
    'admin.owners': 'Owners',
    'admin.addChannel': 'Add channel',
    'admin.addOwner': 'Add owner',
    'admin.editDossier': 'Edit dossier',
    'admin.stats': 'Statistics',
    
    // Activity levels
    'activity.high': 'High',
    'activity.medium': 'Medium',
    'activity.low': 'Low',
    
    // Messages
    'msg.loginSuccess': 'Login successful!',
    'msg.registerSuccess': 'Registration successful!',
    'msg.logoutSuccess': 'You have logged out',
    'msg.saveSuccess': 'Saved successfully',
    'msg.deleteSuccess': 'Deleted successfully',
    'msg.error': 'An error occurred',
    'msg.invalidCredentials': 'Invalid email or password',
    'msg.passwordMismatch': 'Passwords do not match',
    'msg.invalidSecret': 'Invalid secret code',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('uk');

  useEffect(() => {
    const savedLang = localStorage.getItem('media_space_language') as Language;
    if (savedLang && (savedLang === 'uk' || savedLang === 'en')) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('media_space_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.uk] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
