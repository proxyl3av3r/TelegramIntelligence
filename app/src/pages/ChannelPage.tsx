import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Radio, Shield, FileText, Plus, Edit2, Trash2, Save, ExternalLink, Phone, MapPin, Calendar, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useData, type ChannelTab, type OwnerContent, type OverviewBlock } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/ThemeToggle';

export function ChannelPage() {
  const { id } = useParams<{ id: string }>();
  const { user, logout, isAdmin } = useAuth();
  const { fetchChannel, addTab, updateTab } = useData();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [channel, setChannel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');
  const [showAddTabDialog, setShowAddTabDialog] = useState(false);
  const [editingTab, setEditingTab] = useState<string | null>(null);

  // Fetch channel on mount
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchChannel(id)
        .then((data) => {
          setChannel(data);
          if (data.tabs.length > 0) {
            setActiveTab(data.tabs[0].id);
          }
        })
        .catch(() => {
          toast.error(language === 'uk' ? 'Помилка завантаження каналу' : 'Error loading channel');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, fetchChannel, language]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{language === 'uk' ? 'Канал не знайдено' : 'Channel not found'}</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success(t('msg.logoutSuccess'));
    navigate('/');
  };

  const getRatingColorClass = (color: string | null) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'green': return 'bg-green-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  const handleAddTab = (nameUk: string, nameEn: string, template: 'owner' | 'overview') => {
    const newTab = {
      nameUk,
      nameEn,
      template,
    };
    addTab(channel.id, newTab).then((tabId) => {
      // Refresh channel data
      fetchChannel(channel.id).then((data) => {
        setChannel(data);
      });
    });
    setShowAddTabDialog(false);
    toast.success(language === 'uk' ? 'Вкладку додано' : 'Tab added');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/channels" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold hidden sm:block">{t('app.name')}</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              {isAdmin && (
                <Button variant="ghost" onClick={() => navigate('/admin')} className="hidden sm:flex text-yellow-500">
                  <Shield className="w-4 h-4 mr-2" />
                  {t('nav.admin')}
                </Button>
              )}

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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
          <Button variant="ghost" onClick={() => navigate('/channels')} className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            {t('nav.backToChannels')}
          </Button>
        </motion.div>

        {/* Channel Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative">
              <Avatar className="w-20 h-20 rounded-xl">
                <AvatarImage src={channel.avatar} />
                <AvatarFallback className="text-2xl">{channel.name[0]}</AvatarFallback>
              </Avatar>
              {channel.ratingColor && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${getRatingColorClass(channel.ratingColor)} border-2 border-background ring-2 ring-background`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{channel.name}</h1>
                <Badge variant="secondary">{channel.category}</Badge>
                <Badge variant="outline" className="text-xs">
                  {channel.region === 'all' ? t('region.allUkraine') : t('region.kharkiv')}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-2">{channel.username}</p>
              <p className="text-foreground/80">{channel.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <TabsList className="bg-secondary/50 h-auto flex-wrap">
              {channel.tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {language === 'uk' ? tab.nameUk : tab.nameEn}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {isAdmin && (
              <Button size="sm" variant="outline" onClick={() => setShowAddTabDialog(true)} className="rounded-full">
                <Plus className="w-4 h-4 mr-1" />
                {t('tab.addTab')}
              </Button>
            )}
          </div>

          {channel.tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              {tab.template === 'owner' ? (
                <OwnerTab 
                  content={tab.content || {}}
                  tabId={tab.id}
                  isEditing={editingTab === tab.id}
                  onEdit={() => setEditingTab(tab.id)}
                  onSave={() => {
                    setEditingTab(null);
                    // Refresh channel data
                    fetchChannel(channel.id).then((data) => {
                      setChannel(data);
                    });
                    toast.success(t('msg.saveSuccess'));
                  }}
                  onCancel={() => setEditingTab(null)}
                />
              ) : (
                <OverviewTab
                  blocks={tab.blocks || []}
                  tabId={tab.id}
                  isEditing={editingTab === tab.id}
                  onEdit={() => setEditingTab(tab.id)}
                  onSave={() => {
                    setEditingTab(null);
                    // Refresh channel data
                    fetchChannel(channel.id).then((data) => {
                      setChannel(data);
                    });
                    toast.success(t('msg.saveSuccess'));
                  }}
                  onCancel={() => setEditingTab(null)}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <AddTabDialog 
        open={showAddTabDialog} 
        onClose={() => setShowAddTabDialog(false)}
        onAdd={handleAddTab}
      />
    </div>
  );
}

// Owner Tab Component
function OwnerTab({ 
  content, 
  tabId,
  isEditing, 
  onEdit, 
  onSave, 
  onCancel 
}: { 
  content: OwnerContent;
  tabId: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { t, language } = useLanguage();
  const { isAdmin, uploadImage, uploadPdf } = useAuth();
  const { updateOwnerContent } = useData();
  const [editedContent, setEditedContent] = useState<OwnerContent>(content || {});

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadImage(file);
      setEditedContent({ ...editedContent, photo: url });
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = await uploadPdf(file);
      setEditedContent({ ...editedContent, dossierPdf: url });
      toast.success(language === 'uk' ? 'PDF завантажено' : 'PDF uploaded');
    }
  };

  const handleSave = async () => {
    await updateOwnerContent(tabId, editedContent);
    onSave();
  };

  if (isEditing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{language === 'uk' ? 'Редагування' : 'Editing'}</h3>
        </div>

        {/* Photo */}
        <div className="space-y-2">
          <Label>{t('owner.photo')}</Label>
          <div className="flex items-center gap-4">
            {editedContent.photo && (
              <img src={editedContent.photo} alt="" className="w-24 h-24 rounded-xl object-cover" />
            )}
            <Input type="file" accept="image/*" onChange={handleImageUpload} className="max-w-xs" />
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label>{t('owner.fullName')}</Label>
          <Input 
            value={editedContent.fullName} 
            onChange={(e) => setEditedContent({ ...editedContent, fullName: e.target.value })} 
            placeholder="Іванов Іван Іванович"
          />
        </div>

        {/* Birth Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('owner.birthDate')}</Label>
            <Input 
              type="date"
              value={editedContent.birthDate} 
              onChange={(e) => setEditedContent({ ...editedContent, birthDate: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>{t('owner.birthPlace')}</Label>
            <Input 
              value={editedContent.birthPlace} 
              onChange={(e) => setEditedContent({ ...editedContent, birthPlace: e.target.value })} 
              placeholder="м. Київ"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('owner.residence')}</Label>
            <Input 
              value={editedContent.residence} 
              onChange={(e) => setEditedContent({ ...editedContent, residence: e.target.value })} 
              placeholder="м. Харків"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('owner.phone')}</Label>
            <Input 
              value={editedContent.phone} 
              onChange={(e) => setEditedContent({ ...editedContent, phone: e.target.value })} 
              placeholder="+380..."
            />
          </div>
        </div>

        {/* Media Activity */}
        <div className="space-y-2">
          <Label>{t('owner.mediaActivity')}</Label>
          <Textarea 
            value={editedContent.mediaActivity || ''} 
            onChange={(e) => setEditedContent({ ...editedContent, mediaActivity: e.target.value })} 
            placeholder="Опис медіа активності..."
          />
        </div>

        {/* Media Resources */}
        <div className="space-y-2">
          <Label>{t('owner.mediaResources')}</Label>
          <Textarea 
            value={editedContent.mediaResources || ''} 
            onChange={(e) => setEditedContent({ ...editedContent, mediaResources: e.target.value })} 
          />
        </div>

        {/* Social Networks */}
        <div className="space-y-2">
          <Label>{t('owner.socialNetworks')}</Label>
          <Textarea 
            value={editedContent.socialNetworks || ''} 
            onChange={(e) => setEditedContent({ ...editedContent, socialNetworks: e.target.value })} 
            placeholder="Facebook: https://..., Instagram: https://..."
          />
        </div>

        {/* Dossier File */}
        <div className="space-y-2">
          <Label>{t('owner.dossier')}</Label>
          <div className="flex items-center gap-4">
            {editedContent.dossierPdf ? (
              <a 
                href={editedContent.dossierPdf} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <FileText className="w-5 h-5" />
                PDF
              </a>
            ) : (
              <span className="text-muted-foreground">{language === 'uk' ? 'Немає файлу' : 'No file'}</span>
            )}
            <Input type="file" accept=".pdf" onChange={handlePdfUpload} className="max-w-xs" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onCancel}>{t('channel.cancel')}</Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            {t('channel.save')}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="w-4 h-4 mr-2" />
            {t('channel.edit')}
          </Button>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Photo */}
          {content.photo && (
            <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
              <img src={content.photo} alt={content.fullName} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 space-y-4">
            {content.fullName && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{t('owner.fullName')}</span>
                </div>
                <p className="text-xl font-semibold">{content.fullName}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {content.birthDate && (
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{t('owner.birthDate')}</span>
                  </div>
                  <p>{content.birthDate}</p>
                </div>
              )}
              {content.birthPlace && (
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{t('owner.birthPlace')}</span>
                  </div>
                  <p>{content.birthPlace}</p>
                </div>
              )}
            </div>

            {content.residence && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{t('owner.residence')}</span>
                </div>
                <p>{content.residence}</p>
              </div>
            )}

            {content.phone && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{t('owner.phone')}</span>
                </div>
                <p>{content.phone}</p>
              </div>
            )}

            {content.mediaActivity && (
              <div className="pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground block mb-2">{t('owner.mediaActivity')}</span>
                <p className="text-foreground/80 whitespace-pre-line">{content.mediaActivity}</p>
              </div>
            )}

            {content.mediaResources && (
              <div className="pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground block mb-2">{t('owner.mediaResources')}</span>
                <p className="text-foreground/80 whitespace-pre-line">{content.mediaResources}</p>
              </div>
            )}

            {content.socialNetworks && (
              <div className="pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground block mb-2">{t('owner.socialNetworks')}</span>
                <p className="text-foreground/80 whitespace-pre-line">{content.socialNetworks}</p>
              </div>
            )}

            {content.dossierPdf && (
              <div className="pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground block mb-2">{t('owner.dossier')}</span>
                <a 
                  href={content.dossierPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  {language === 'uk' ? 'Відкрити PDF' : 'Open PDF'}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Overview Tab Component
function OverviewTab({
  blocks,
  tabId,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: {
  blocks: OverviewBlock[];
  tabId: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const { t, language } = useLanguage();
  const { isAdmin, uploadImage } = useAuth();
  const { addBlock, updateBlock, deleteBlock } = useData();
  const [editedBlocks, setEditedBlocks] = useState<OverviewBlock[]>(blocks);
  const [newBlockTitleUk, setNewBlockTitleUk] = useState('');
  const [newBlockTitleEn, setNewBlockTitleEn] = useState('');
  const [newBlockContentUk, setNewBlockContentUk] = useState('');
  const [newBlockContentEn, setNewBlockContentEn] = useState('');

  const handleAddBlock = async () => {
    if (newBlockTitleUk || newBlockTitleEn) {
      await addBlock(tabId, {
        titleUk: newBlockTitleUk,
        titleEn: newBlockTitleEn,
        contentUk: newBlockContentUk,
        contentEn: newBlockContentEn,
        images: [],
      });
      setNewBlockTitleUk('');
      setNewBlockTitleEn('');
      setNewBlockContentUk('');
      setNewBlockContentEn('');
      onSave();
    }
  };

  const handleUpdateBlock = async (blockId: string, updates: Partial<OverviewBlock>) => {
    await updateBlock(blockId, updates);
    onSave();
  };

  const handleDeleteBlock = async (blockId: string) => {
    await deleteBlock(blockId);
    onSave();
  };

  const handleImageUpload = async (blockId: string, file: File) => {
    const url = await uploadImage(file);
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      await updateBlock(blockId, { images: [...(block.images || []), url] });
      onSave();
    }
  };

  if (isEditing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {blocks.map((block) => (
          <div key={block.id} className="glass rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder={language === 'uk' ? 'Заголовок (Українська)' : 'Title (Ukrainian)'}
                  value={block.titleUk}
                  onChange={(e) => handleUpdateBlock(block.id, { titleUk: e.target.value })}
                  className="font-semibold"
                />
                <Input
                  placeholder={language === 'uk' ? 'Заголовок (English)' : 'Title (English)'}
                  value={block.titleEn}
                  onChange={(e) => handleUpdateBlock(block.id, { titleEn: e.target.value })}
                  className="text-sm"
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteBlock(block.id)} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              placeholder={language === 'uk' ? 'Контент (Українська)' : 'Content (Ukrainian)'}
              value={block.contentUk}
              onChange={(e) => handleUpdateBlock(block.id, { contentUk: e.target.value })}
              rows={3}
            />
            <Textarea
              placeholder={language === 'uk' ? 'Контент (English)' : 'Content (English)'}
              value={block.contentEn}
              onChange={(e) => handleUpdateBlock(block.id, { contentEn: e.target.value })}
              rows={3}
            />
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(block.id, e.target.files[0])}
                className="mb-2 max-w-xs"
              />
              <div className="flex flex-wrap gap-2">
                {(block.images || []).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Block */}
        <div className="glass rounded-xl p-5 space-y-3 border-dashed border-2">
          <h4 className="font-semibold">{language === 'uk' ? 'Додати новий блок' : 'Add new block'}</h4>
          <Input
            placeholder={language === 'uk' ? 'Заголовок (Українська)' : 'Title (Ukrainian)'}
            value={newBlockTitleUk}
            onChange={(e) => setNewBlockTitleUk(e.target.value)}
          />
          <Input
            placeholder={language === 'uk' ? 'Заголовок (English)' : 'Title (English)'}
            value={newBlockTitleEn}
            onChange={(e) => setNewBlockTitleEn(e.target.value)}
          />
          <Textarea
            placeholder={language === 'uk' ? 'Контент (Українська)' : 'Content (Ukrainian)'}
            value={newBlockContentUk}
            onChange={(e) => setNewBlockContentUk(e.target.value)}
            rows={3}
          />
          <Textarea
            placeholder={language === 'uk' ? 'Контент (English)' : 'Content (English)'}
            value={newBlockContentEn}
            onChange={(e) => setNewBlockContentEn(e.target.value)}
            rows={3}
          />
          <Button onClick={handleAddBlock} variant="outline" className="w-full">
            <Plus className="w-5 h-5 mr-2" />
            {t('overview.addBlock')}
          </Button>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel}>{t('channel.cancel')}</Button>
          <Button onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            {t('channel.save')}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="w-4 h-4 mr-2" />
            {t('channel.edit')}
          </Button>
        </div>
      )}

      {blocks.map((block) => (
        <div key={block.id} className="glass rounded-xl p-6">
          {((language === 'uk' ? block.titleUk : block.titleEn)) && (
            <h3 className="text-xl font-semibold mb-3">{language === 'uk' ? block.titleUk : block.titleEn}</h3>
          )}
          <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
            {language === 'uk' ? block.contentUk : block.contentEn}
          </p>
          {(block.images || []).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {block.images.map((img, i) => (
                <img key={i} src={img} alt="" className="rounded-lg object-cover w-full h-48" />
              ))}
            </div>
          )}
        </div>
      ))}

      {blocks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground glass rounded-xl">
          {language === 'uk' ? 'Немає контенту' : 'No content'}
        </div>
      )}
    </motion.div>
  );
}

// Add Tab Dialog
function AddTabDialog({ 
  open, 
  onClose, 
  onAdd 
}: { 
  open: boolean; 
  onClose: () => void;
  onAdd: (name: string, type: TabType) => void;
}) {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [type, setType] = useState<TabType>('owner');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onAdd(name, type);
      setName('');
      setType('owner');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>{t('tab.addTab')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{language === 'uk' ? 'Назва вкладки' : 'Tab name'}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={language === 'uk' ? 'Наприклад: Власник' : 'e.g. Owner'} />
          </div>
          <div className="space-y-2">
            <Label>{t('tab.template')}</Label>
            <Select value={type} onValueChange={(v: TabType) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">{t('tab.template.owner')}</SelectItem>
                <SelectItem value="overview">{t('tab.template.overview')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>{t('channel.cancel')}</Button>
            <Button type="submit">{t('channel.save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
