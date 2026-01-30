import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut,
  Radio,
  Settings,
  Database,
  Search,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useData, type RatingColor } from '@/contexts/DataContext';
import type { Channel } from '@/contexts/DataContext';
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

const categories = ['Новини', 'Політика', 'Економіка', 'Розваги', 'Спорт', 'Культура', 'Технології'];
const ratingColors: { value: RatingColor; label: string }[] = [
  { value: 'red', label: 'Червоний' },
  { value: 'green', label: 'Зелений' },
  { value: 'purple', label: 'Фіолетовий' },
];

export function AdminPage() {
  const { user, logout, isAdmin } = useAuth();
  const { channels, deleteChannel } = useData();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showChannelForm, setShowChannelForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<typeof channels[0] | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string>('');

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
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>

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
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/channels')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('nav.backToChannels')}
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">{t('admin.title')}</h1>
          </div>
          <p className="text-muted-foreground">{t('admin.description')}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-6 mb-8"
        >
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">{t('admin.channels')}</span>
            </div>
            <div className="text-3xl font-bold">{channels.length}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
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

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('admin.channels')}</h2>
          <Button onClick={() => { setEditingChannel(null); setShowChannelForm(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.addChannel')}
          </Button>
        </div>

        <div className="space-y-3">
          {filteredChannels.map((channel) => (
            <div key={channel.id} className="glass rounded-xl p-4 flex items-center gap-4">
              <Avatar className="w-12 h-12 rounded-xl">
                <AvatarImage src={channel.avatar} />
                <AvatarFallback>{channel.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{channel.name}</h3>
                  <Badge variant="secondary" className="text-xs">{channel.category}</Badge>
                  {channel.ratingColor && (
                    <div className={`w-3 h-3 rounded-full ${
                      channel.ratingColor === 'red' ? 'bg-red-500' : 
                      channel.ratingColor === 'green' ? 'bg-green-500' : 'bg-purple-500'
                    }`} />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{channel.username}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => { setEditingChannel(channel); setShowChannelForm(true); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(channel.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredChannels.length === 0 && (
          <div className="text-center py-12 glass rounded-xl">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{language === 'uk' ? 'Канали не знайдено' : 'No channels found'}</p>
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
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle>{channel ? (language === 'uk' ? 'Редагувати канал' : 'Edit channel') : (language === 'uk' ? 'Додати канал' : 'Add channel')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
              {previewImage ? <img src={previewImage} alt="" className="w-full h-full object-cover" /> : <span className="text-muted-foreground">No image</span>}
            </div>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className="space-y-2">
            <Label>{language === 'uk' ? 'Назва каналу' : 'Channel name'}</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="@channel" required />
          </div>

          <div className="space-y-2">
            <Label>{language === 'uk' ? 'Опис' : 'Description'}</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
                  {ratingColors.map((c) => <SelectItem key={c.value} value={c.value!}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>{language === 'uk' ? 'Скасувати' : 'Cancel'}</Button>
            <Button type="submit" disabled={isLoading}>{language === 'uk' ? 'Зберегти' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
