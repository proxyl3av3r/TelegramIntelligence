import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, LogOut, Radio, Shield, Globe, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useData, type Region, type RatingColor } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const categories = ['Всі', 'Новини', 'Політика', 'Економіка', 'Розваги', 'Спорт', 'Культура', 'Технології'];
const categoriesEn = ['All', 'News', 'Politics', 'Economy', 'Entertainment', 'Sports', 'Culture', 'Technology'];

const ratingColors: { value: RatingColor; label: string; class: string }[] = [
  { value: 'red', label: 'rating.red', class: 'bg-red-500' },
  { value: 'green', label: 'rating.green', class: 'bg-green-500' },
  { value: 'purple', label: 'rating.purple', class: 'bg-purple-500' },
];

export function ChannelsPage() {
  const location = useLocation();
  const initialRegion = (location.state?.region as Region) || 'all';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всі');
  const [selectedRegion, setSelectedRegion] = useState<Region>(initialRegion);
  const [selectedRating, setSelectedRating] = useState<RatingColor>(null);
  
  const { user, logout, isAdmin } = useAuth();
  const { channels } = useData();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      const matchesSearch = 
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.username.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'Всі' || channel.category === selectedCategory;
      const matchesRegion = selectedRegion === 'all' || channel.region === selectedRegion;
      const matchesRating = !selectedRating || channel.ratingColor === selectedRating;
      
      return matchesSearch && matchesCategory && matchesRegion && matchesRating;
    });
  }, [channels, searchQuery, selectedCategory, selectedRegion, selectedRating]);

  const handleLogout = () => {
    logout();
    toast.success(t('msg.logoutSuccess'));
    navigate('/');
  };

  const getRatingColorClass = (color: RatingColor) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'green': return 'bg-green-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const catList = language === 'uk' ? categories : categoriesEn;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/channels" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold hidden sm:block">{t('app.name')}</span>
            </Link>

            {/* Region Selector */}
            <div className="flex items-center gap-2">
              <Button
                variant={selectedRegion === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedRegion('all')}
              >
                <Globe className="w-4 h-4 mr-1" />
                {t('region.allUkraine')}
              </Button>
              <Button
                variant={selectedRegion === 'kharkiv' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedRegion('kharkiv')}
              >
                <MapPin className="w-4 h-4 mr-1" />
                {t('region.kharkiv')}
              </Button>
            </div>

            {/* Admin Link */}
            {isAdmin && (
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="mr-2 hidden sm:flex"
              >
                <Shield className="w-4 h-4 mr-2 text-yellow-400" />
                {t('nav.admin')}
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                    <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block">{user?.username}</span>
                  {isAdmin && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 text-xs hidden sm:flex">
                      Admin
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem className="text-muted-foreground">
                  {user?.email}
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')} className="sm:hidden">
                    <Shield className="w-4 h-4 mr-2 text-yellow-400" />
                    {t('nav.admin')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">{t('nav.channels')}</h1>
          <p className="text-muted-foreground">
            {language === 'uk' 
              ? 'Оберіть канал для перегляду детальної інформації'
              : 'Select a channel to view detailed information'}
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('filter.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          {/* Categories */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground mr-2">{t('filter.categories')}</span>
            {catList.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-primary' : 'border-border'}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Rating Colors */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground mr-2">{t('filter.ratingColors')}</span>
            <Button
              variant={selectedRating === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRating(null)}
              className={selectedRating === null ? 'bg-primary' : 'border-border'}
            >
              {t('filter.all')}
            </Button>
            {ratingColors.map((rating) => (
              <Button
                key={rating.value}
                variant={selectedRating === rating.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRating(rating.value)}
                className={`${selectedRating === rating.value ? rating.class : 'border-border'} text-white`}
              >
                {t(rating.label)}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Channels Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChannels.map((channel, index) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/channel/${channel.id}`}>
                <div className="glass rounded-2xl p-6 hover:border-primary/30 transition-all group cursor-pointer h-full relative">
                  {/* Rating Color Indicator */}
                  {channel.ratingColor && (
                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${getRatingColorClass(channel.ratingColor)}`} />
                  )}

                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-14 h-14 rounded-xl">
                      <AvatarImage src={channel.avatar} />
                      <AvatarFallback>{channel.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 pr-6">
                      <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {channel.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{channel.username}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {channel.description}
                  </p>

                  {/* Category & Region */}
                  <div className="flex gap-2 mt-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {channel.category}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {channel.region === 'all' ? t('region.allUkraine') : t('region.kharkiv')}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredChannels.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {language === 'uk' ? 'Канали не знайдено' : 'No channels found'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'uk' 
                ? 'Спробуйте змінити параметри пошуку'
                : 'Try changing search parameters'}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
