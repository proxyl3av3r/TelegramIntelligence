import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Database, Search, Lock, ChevronRight, Radio, Globe, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Region } from '@/contexts/DataContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const features = [
    {
      icon: Database,
      title: language === 'uk' ? 'База каналів' : 'Channel Database',
      description: language === 'uk' 
        ? 'Детальна інформація про телеграм-канали' 
        : 'Detailed information about Telegram channels',
    },
    {
      icon: Search,
      title: language === 'uk' ? 'Пошук та фільтри' : 'Search & Filters',
      description: language === 'uk'
        ? 'Зручний пошук за регіоном, категорією та рейтингом'
        : 'Easy search by region, category and rating',
    },
    {
      icon: Shield,
      title: language === 'uk' ? 'Досьє власників' : 'Owner Dossiers',
      description: language === 'uk'
        ? 'Повна інформація про людей за каналами'
        : 'Complete information about people behind channels',
    },
    {
      icon: Lock,
      title: language === 'uk' ? 'Захищений доступ' : 'Secure Access',
      description: language === 'uk'
        ? 'Тільки для авторизованих користувачів'
        : 'Only for authorized users',
    },
  ];

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
    if (isAuthenticated) {
      navigate('/channels', { state: { region } });
    }
  };

  const handleContinue = () => {
    if (selectedRegion) {
      navigate('/channels', { state: { region: selectedRegion } });
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-card/80 backdrop-blur-sm rounded-full p-1 border border-border">
          <Button
            variant={language === 'uk' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLanguage('uk')}
            className={`text-xs rounded-full ${language === 'uk' ? '' : 'hover:bg-transparent'}`}
          >
            UA
          </Button>
          <Button
            variant={language === 'en' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLanguage('en')}
            className={`text-xs rounded-full ${language === 'en' ? '' : 'hover:bg-transparent'}`}
          >
            EN
          </Button>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] animate-pulse-glow ${
            theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'
          }`} />
          <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] animate-pulse-glow ${
            theme === 'dark' ? 'bg-accent/20' : 'bg-cyan-400/10'
          }`} style={{ animationDelay: '1.5s' }} />
        </div>

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(128,128,128,0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(128,128,128,0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/30">
                <Radio className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-primary/30 blur-xl -z-10" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-4"
          >
            <span className="gradient-text">{t('app.name')}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            {t('app.tagline')}
          </motion.p>

          {/* Region Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-10"
          >
            <p className="text-sm text-muted-foreground mb-4">{t('region.select')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant={selectedRegion === 'all' ? 'default' : 'outline'}
                onClick={() => handleRegionSelect('all')}
                className={`px-8 py-6 text-lg rounded-xl transition-all ${
                  selectedRegion === 'all' 
                    ? 'bg-primary shadow-lg shadow-primary/30' 
                    : 'border-2 hover:border-primary hover:bg-primary/5'
                }`}
              >
                <Globe className="w-5 h-5 mr-2" />
                {t('region.allUkraine')}
              </Button>
              <Button
                size="lg"
                variant={selectedRegion === 'kharkiv' ? 'default' : 'outline'}
                onClick={() => handleRegionSelect('kharkiv')}
                className={`px-8 py-6 text-lg rounded-xl transition-all ${
                  selectedRegion === 'kharkiv' 
                    ? 'bg-primary shadow-lg shadow-primary/30' 
                    : 'border-2 hover:border-primary hover:bg-primary/5'
                }`}
              >
                <MapPin className="w-5 h-5 mr-2" />
                {t('region.kharkiv')}
              </Button>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!selectedRegion}
                className="bg-primary hover:bg-primary/90 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-primary/30 disabled:opacity-50"
              >
                {t('nav.channels')}
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="bg-primary hover:bg-primary/90 text-white px-10 py-6 text-lg rounded-xl shadow-lg shadow-primary/30"
                >
                  {t('auth.login')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/register')}
                  className="border-2 px-10 py-6 text-lg rounded-xl hover:bg-secondary"
                >
                  {t('auth.register')}
                </Button>
              </>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: '1000+', label: language === 'uk' ? 'Каналів' : 'Channels' },
              { value: '500+', label: language === 'uk' ? 'Досьє' : 'Dossiers' },
              { value: '2', label: language === 'uk' ? 'Регіони' : 'Regions' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3">
              {language === 'uk' ? 'Можливості платформи' : 'Platform Features'}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {language === 'uk' 
                ? 'Все необхідне для аналізу телеграм-каналів'
                : 'Everything you need to analyze Telegram channels'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-2xl p-6 card-hover cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">{t('app.name')}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 {t('app.name')}. {language === 'uk' ? 'Всі права захищені.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
