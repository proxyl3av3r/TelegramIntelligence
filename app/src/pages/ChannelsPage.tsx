import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, LogOut, Radio, Shield, Globe, MapPin, Filter, X } from 'lucide-react';
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
import { ThemeToggle } from '@/components/ThemeToggle';

const categories = ['Всі', 'Новини', 'Політика', 'Економіка', 'Розваги', 'Спорт', 'Культура', 'Технології'];
const categoriesEn = ['All', 'News', 'Politics', 'Economy', 'Entertainment', 'Sports', 'Culture', 'Technology'];

const ratingColors: { value: RatingColor; labelUk: string; labelEn: string; colorClass: string }[] = [
  { value: 'red', labelUk: 'Червоний', labelEn: 'Red', colorClass: 'bg-red-500 hover:bg-red-600' },
  { value: 'green', labelUk: 'Зелений', labelEn: 'Green', colorClass: 'bg-green-500 hover:bg-green-600' },
  { value: 'purple', labelUk: 'Фіолетовий', labelEn: 'Purple', colorClass: 'bg-purple-500 hover:bg-purple-600' },
];

export function ChannelsPage() {
  const location = useLocation();
  const initialRegion = (location.state?.region as Region) || 'all';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всі');
  const [selectedRegion, setSelectedRegion] = useState<Region>(initialRegion);
  const [selectedRating, setSelectedRating] = useState<RatingColor>(null);
  const [showFilters, setShowFilters] = useState(false);
  
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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Всі');
    setSelectedRegion('all');
    setSelectedRating(null);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'Всі' || selectedRegion !== 'all' || selectedRating;

  const getRatingColorClass = (color: RatingColor) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'green': return 'bg-green-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  const catList = language === 'uk' ? categories : categoriesEn;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/channels" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold hidden md:block">{t('app.name')}</span>
            </Link>

            {/* Search - centered */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('filter.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              {/* Admin Link */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/admin')}
                  className="hidden sm:flex items-center gap-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden lg:inline">{t('nav.admin')}</span>
                </Button>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-1 pr-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                      <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border">
                  <DropdownMenuItem className="text-muted-foreground text-sm">
                    {user?.email}
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="sm:hidden">
                      <Shield className="w-4 h-4 mr-2 text-yellow-500" />
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Region Filter */}
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1">
              <Button
                variant={selectedRegion === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedRegion('all')}
                className={`rounded-md ${selectedRegion === 'all' ? '' : 'hover:bg-transparent'}`}
              >
                <Globe className="w-4 h-4 mr-1.5" />
                {t('region.allUkraine')}
              </Button>
              <Button
                variant={selectedRegion === 'kharkiv' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedRegion('kharkiv')}
                className={`rounded-md ${selectedRegion === 'kharkiv' ? '' : 'hover:bg-transparent'}`}
              >
                <MapPin className="w-4 h-4 mr-1.5" />
                {t('region.kharkiv')}
              </Button>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-border hidden sm:block" />

            {/* Category Filter */}
            <div className="flex items-center gap-1 flex-wrap">
              {catList.slice(0, 4).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full text-xs ${selectedCategory === category ? '' : 'hover:bg-secondary'}`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* More Filters Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full ml-auto"
            >
              <Filter className="w-4 h-4 mr-1.5" />
              {language === 'uk' ? 'Фільтри' : 'Filters'}
              {hasActiveFilters && (
                <span className="ml-1.5 w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                {language === 'uk' ? 'Скинути' : 'Clear'}
              </Button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-secondary/30 rounded-xl"
            >
              {/* All Categories */}
              <div className="mb-4">
                <span className="text-sm text-muted-foreground block mb-2">{t('filter.categories')}</span>
                <div className="flex flex-wrap gap-2">
                  {catList.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-full text-xs ${selectedCategory === category ? '' : 'border-border'}`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Rating Colors */}
              <div>
                <span className="text-sm text-muted-foreground block mb-2">{t('filter.ratingColors')}</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedRating === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRating(null)}
                    className={`rounded-full text-xs ${selectedRating === null ? '' : 'border-border'}`}
                  >
                    {t('filter.all')}
                  </Button>
                  {ratingColors.map((rating) => (
                    <Button
                      key={rating.value}
                      variant={selectedRating === rating.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedRating(rating.value)}
                      className={`rounded-full text-xs text-white border-0 ${
                        selectedRating === rating.value 
                          ? rating.colorClass 
                          : `${rating.colorClass} opacity-60 hover:opacity-100`
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-white/80 mr-1.5" />
                      {language === 'uk' ? rating.labelUk : rating.labelEn}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {language === 'uk' 
              ? `Знайдено ${filteredChannels.length} каналів`
              : `Found ${filteredChannels.length} channels`
            }
          </p>
        </div>

        {/* Channels Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredChannels.map((channel, index) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/channel/${channel.id}`}>
                <div className="glass rounded-xl p-4 card-hover group cursor-pointer h-full relative border-l-4"
                  style={{ borderLeftColor: channel.ratingColor ? 
                    (channel.ratingColor === 'red' ? '#ef4444' : 
                     channel.ratingColor === 'green' ? '#22c55e' : 
                     channel.ratingColor === 'purple' ? '#a855f7' : 'transparent') : 'transparent' 
                  }}
                >
                  {/* Rating Color Indicator */}
                  {channel.ratingColor && (
                    <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${getRatingColorClass(channel.ratingColor)} ring-2 ring-background`} />
                  )}

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-12 h-12 rounded-lg flex-shrink-0">
                      <AvatarImage src={channel.avatar} />
                      <AvatarFallback className="text-lg">{channel.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                        {channel.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{channel.username}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {channel.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {channel.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-normal">
                      {channel.region === 'all' ? t('region.allUkraine') : t('region.kharkiv')}
                    </Badge>
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
            className="empty-state"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {language === 'uk' ? 'Канали не знайдено' : 'No channels found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'uk' 
                ? 'Спробуйте змінити параметри пошуку'
                : 'Try changing search parameters'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                {language === 'uk' ? 'Скинути фільтри' : 'Clear filters'}
              </Button>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
