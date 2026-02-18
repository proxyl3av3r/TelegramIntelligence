import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit2, Trash2, LogOut, Radio, Database, Search, Shield, X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useData, type RatingColor } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Channel } from '@/contexts/DataContext';

const categories = ['Новини', 'Політика', 'Економіка', 'Розваги', 'Спорт', 'Культура', 'Технології'];

const ratingColors: { value: RatingColor; labelUk: string; labelEn: string; colorClass: string }[] = [
  { value: 'red', labelUk: 'Червоний', labelEn: 'Red', colorClass: 'bg-red-500' },
  { value: 'green', labelUk: 'Зелений', labelEn: 'Green', colorClass: 'bg-green-500' },
  { value: 'purple', labelUk: 'Фіолетовий', labelEn: 'Purple', colorClass: 'bg-purple-500' },
];

export function AdminPage() {
  const { user, logout, isAdmin } = useAuth();
  const { channels, deleteChannel, fetchChannels, isLoading } = useData();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string>('');

  // Fetch channels on mount
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  if (!isAdmin) {
    navigate('/channels');
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success(t('msg.logoutSuccess'));
    navigate('/');
  };

  const filteredChannels = channels.filter(ch => 
    ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteChannel(deleteId);
    toast.success(t('msg.deleteSuccess'));
    setShowDeleteDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/channels" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold hidden sm:block">{t('app.name')}</span>
            </Link>

            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
          <Button variant="ghost" onClick={() => navigate('/channels')} className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            {t('nav.backToChannels')}
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('admin.description')}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{channels.length}</div>
              <div className="text-xs text-muted-foreground">{t('admin.channels')}</div>
            </div>
          </div>
        </motion.div>

        {/* Search and Add */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('filter.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
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
          <Button onClick={() => { setEditingChannel(null); setShowChannelForm(true); }} className="flex-shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.addChannel')}
          </Button>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        )}

        {/* Channels List */}
        {!isLoading && (
        <div className="space-y-3">
          {filteredChannels.map((channel, index) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl p-4 flex items-center gap-4 group"
            >
              <div className="relative">
                <Avatar className="w-12 h-12 rounded-lg">
                  <AvatarImage src={channel.avatar} />
                  <AvatarFallback>{channel.name[0]}</AvatarFallback>
                </Avatar>
                {channel.ratingColor && (
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                    channel.ratingColor === 'red' ? 'bg-red-500' :
                    channel.ratingColor === 'green' ? 'bg-green-500' : 'bg-purple-500'
                  }`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{channel.name}</h3>
                  <Badge variant="secondary" className="text-xs">{channel.category}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {channel.region === 'all' ? t('region.allUkraine') : t('region.kharkiv')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{channel.username}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => { setEditingChannel(channel); setShowChannelForm(true); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive"
                  onClick={() => handleDelete(channel.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredChannels.length === 0 && (
          <div className="text-center py-12 glass rounded-xl">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{language === 'uk' ? 'Канали не знайдено' : 'No channels found'}</p>
          </div>
        )}
        </div>
        )}
      </main>

      <ChannelFormDialog 
        open={showChannelForm} 
        onClose={() => setShowChannelForm(false)}
        channel={editingChannel}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>{language === 'uk' ? 'Ви впевнені?' : 'Are you sure?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'uk' ? 'Цю дію неможливо скасувати. Канал буде видалено назавжди.' : 'This action cannot be undone. The channel will be permanently deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('channel.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
              {t('channel.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Channel Form Dialog
function ChannelFormDialog({ 
  open, 
  onClose, 
  channel 
}: { 
  open: boolean; 
  onClose: () => void;
  channel: Channel | null;
}) {
  const { addChannel, updateChannel, uploadImage } = useData();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(channel?.avatar || null);
  
  const [formData, setFormData] = useState({
    name: channel?.name || '',
    username: channel?.username || '',
    description: channel?.description || '',
    category: channel?.category || categories[0],
    region: channel?.region || 'all' as const,
    ratingColor: channel?.ratingColor || null as RatingColor,
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = await uploadImage(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const channelData = {
        ...formData,
        avatar: previewImage || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}&backgroundColor=0ea5e9`,
      };

      if (channel) {
        updateChannel(channel.id, channelData);
      } else {
        addChannel(channelData);
      }
      toast.success(language === 'uk' ? 'Збережено' : 'Saved');
      onClose();
    } catch {
      toast.error(language === 'uk' ? 'Помилка' : 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{channel ? (language === 'uk' ? 'Редагувати канал' : 'Edit channel') : (language === 'uk' ? 'Додати канал' : 'Add channel')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
              {previewImage ? <img src={previewImage} alt="" className="w-full h-full object-cover" /> : <span className="text-muted-foreground text-sm">No image</span>}
            </div>
            <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-[200px]" />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>{language === 'uk' ? 'Назва каналу' : 'Channel name'}</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="@channel" required />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>{language === 'uk' ? 'Опис' : 'Description'}</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
          </div>

          {/* Category, Region, Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{language === 'uk' ? 'Категорія' : 'Category'}</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'uk' ? 'Регіон' : 'Region'}</Label>
              <Select value={formData.region} onValueChange={(v: 'all' | 'kharkiv') => setFormData({ ...formData, region: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'uk' ? 'Вся Україна' : 'All Ukraine'}</SelectItem>
                  <SelectItem value="kharkiv">{language === 'uk' ? 'Харків' : 'Kharkiv'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'uk' ? 'Рейтинг' : 'Rating'}</Label>
              <Select value={formData.ratingColor || 'none'} onValueChange={(v) => setFormData({ ...formData, ratingColor: v === 'none' ? null : v as RatingColor })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{language === 'uk' ? 'Без кольору' : 'No color'}</SelectItem>
                  {ratingColors.map((c) => (
                    <SelectItem key={c.value} value={c.value!}>
                      <span className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${c.colorClass}`} />
                        {language === 'uk' ? c.labelUk : c.labelEn}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} type="button">{language === 'uk' ? 'Скасувати' : 'Cancel'}</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (language === 'uk' ? 'Збереження...' : 'Saving...') : <><Save className="w-4 h-4 mr-2" />{language === 'uk' ? 'Зберегти' : 'Save'}</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
