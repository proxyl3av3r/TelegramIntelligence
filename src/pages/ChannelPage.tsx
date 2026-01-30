import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, Radio, Shield, FileText, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useData, type TabType, type OwnerTabContent, type OverviewBlock } from '@/contexts/DataContext';
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
  DialogDescription,
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

export function ChannelPage() {
  const { id } = useParams<{ id: string }>();
  const { user, logout, isAdmin } = useAuth();
  const { getChannelById, addTab, updateTab } = useData();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const channel = id ? getChannelById(id) : undefined;
  const [activeTab, setActiveTab] = useState<string>(channel?.tabs[0]?.id || '');
  const [showAddTabDialog, setShowAddTabDialog] = useState(false);
  const [editingTab, setEditingTab] = useState<string | null>(null);

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
      default: return 'bg-gray-500';
    }
  };

  const handleAddTab = (name: string, type: TabType) => {
    const newTab = {
      name,
      type,
      content: type === 'owner' 
        ? {
            photo: '',
            fullName: '',
            birthDate: '',
            birthPlace: '',
            residence: '',
            phone: '',
            mediaActivity: { text: '', links: [] },
            mediaResources: { text: '', links: [] },
            socialNetworks: [],
          } as OwnerTabContent
        : { blocks: [] } as { blocks: OverviewBlock[] },
    };
    addTab(channel.id, newTab);
    setShowAddTabDialog(false);
    toast.success(language === 'uk' ? 'Вкладку додано' : 'Tab added');
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

            {isAdmin && (
              <Button variant="ghost" onClick={() => navigate('/admin')} className="mr-2">
                <Shield className="w-4 h-4 mr-2 text-yellow-400" />
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
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/channels')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('nav.backToChannels')}
          </Button>
        </motion.div>

        {/* Channel Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 rounded-2xl">
                <AvatarImage src={channel.avatar} />
                <AvatarFallback className="text-3xl">{channel.name[0]}</AvatarFallback>
              </Avatar>
              {channel.ratingColor && (
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${getRatingColorClass(channel.ratingColor)} border-2 border-background`} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{channel.name}</h1>
                <Badge variant="secondary">{channel.category}</Badge>
                {isAdmin && (
                  <Button size="sm" variant="outline" onClick={() => navigate('/admin')}>
                    <Edit2 className="w-3 h-3 mr-1" />
                    {t('channel.edit')}
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground mb-2">{channel.username}</p>
              <p className="text-foreground/80">{channel.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <TabsList className="bg-secondary/50 flex-wrap h-auto">
              {channel.tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="relative">
                  {tab.name}
                  {isAdmin && editingTab === tab.id && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {isAdmin && (
              <Button size="sm" variant="outline" onClick={() => setShowAddTabDialog(true)}>
                <Plus className="w-4 h-4 mr-1" />
                {t('tab.addTab')}
              </Button>
            )}
          </div>

          {channel.tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              {tab.type === 'owner' ? (
                <OwnerTab 
                  content={tab.content as OwnerTabContent}
                  isEditing={editingTab === tab.id}
                  onEdit={() => setEditingTab(tab.id)}
                  onSave={(content) => {
                    updateTab(channel.id, tab.id, { content });
                    setEditingTab(null);
                    toast.success(t('msg.saveSuccess'));
                  }}
                  onCancel={() => setEditingTab(null)}
                />
              ) : (
                <OverviewTab
                  content={tab.content as { blocks: OverviewBlock[] }}
                  isEditing={editingTab === tab.id}
                  onEdit={() => setEditingTab(tab.id)}
                  onSave={(content) => {
                    updateTab(channel.id, tab.id, { content });
                    setEditingTab(null);
                    toast.success(t('msg.saveSuccess'));
                  }}
                  onCancel={() => setEditingTab(null)}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Add Tab Dialog */}
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
  isEditing, 
  onEdit, 
  onSave, 
  onCancel 
}: { 
  content: OwnerTabContent;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (content: OwnerTabContent) => void;
  onCancel: () => void;
}) {
  const { t, language } = useLanguage();
  const { isAdmin, uploadImage, uploadPdf } = useAuth();
  const [editedContent, setEditedContent] = useState(content);
  const [newLink, setNewLink] = useState('');
  const [newResourceLink, setNewResourceLink] = useState('');
  const [newSocialName, setNewSocialName] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

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
      setEditedContent({ ...editedContent, dossierFile: url });
      toast.success(language === 'uk' ? 'PDF завантажено' : 'PDF uploaded');
    }
  };

  if (isEditing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 space-y-6">
        {/* Photo */}
        <div className="space-y-2">
          <Label>{t('owner.photo')}</Label>
          <div className="flex items-center gap-4">
            {editedContent.photo && (
              <img src={editedContent.photo} alt="" className="w-24 h-24 rounded-xl object-cover" />
            )}
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label>{t('owner.fullName')}</Label>
          <Input 
            value={editedContent.fullName} 
            onChange={(e) => setEditedContent({ ...editedContent, fullName: e.target.value })} 
          />
        </div>

        {/* Birth Date & Place */}
        <div className="grid grid-cols-2 gap-4">
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
            />
          </div>
        </div>

        {/* Residence & Phone */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('owner.residence')}</Label>
            <Input 
              value={editedContent.residence} 
              onChange={(e) => setEditedContent({ ...editedContent, residence: e.target.value })} 
            />
          </div>
          <div className="space-y-2">
            <Label>{t('owner.phone')}</Label>
            <Input 
              value={editedContent.phone} 
              onChange={(e) => setEditedContent({ ...editedContent, phone: e.target.value })} 
            />
          </div>
        </div>

        {/* Media Activity */}
        <div className="space-y-2">
          <Label>{t('owner.mediaActivity')}</Label>
          <Textarea 
            value={editedContent.mediaActivity.text} 
            onChange={(e) => setEditedContent({ 
              ...editedContent, 
              mediaActivity: { ...editedContent.mediaActivity, text: e.target.value }
            })} 
          />
          <div className="flex gap-2">
            <Input 
              placeholder="URL посилання" 
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
            />
            <Button onClick={() => {
              if (newLink) {
                setEditedContent({
                  ...editedContent,
                  mediaActivity: {
                    ...editedContent.mediaActivity,
                    links: [...editedContent.mediaActivity.links, newLink]
                  }
                });
                setNewLink('');
              }
            }}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {editedContent.mediaActivity.links.map((link, i) => (
              <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Media Resources */}
        <div className="space-y-2">
          <Label>{t('owner.mediaResources')}</Label>
          <Textarea 
            value={editedContent.mediaResources.text} 
            onChange={(e) => setEditedContent({ 
              ...editedContent, 
              mediaResources: { ...editedContent.mediaResources, text: e.target.value }
            })} 
          />
          <div className="flex gap-2">
            <Input 
              placeholder="URL посилання" 
              value={newResourceLink}
              onChange={(e) => setNewResourceLink(e.target.value)}
            />
            <Button onClick={() => {
              if (newResourceLink) {
                setEditedContent({
                  ...editedContent,
                  mediaResources: {
                    ...editedContent.mediaResources,
                    links: [...editedContent.mediaResources.links, newResourceLink]
                  }
                });
                setNewResourceLink('');
              }
            }}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Social Networks */}
        <div className="space-y-2">
          <Label>{t('owner.socialNetworks')}</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="Назва" 
              value={newSocialName}
              onChange={(e) => setNewSocialName(e.target.value)}
            />
            <Input 
              placeholder="URL" 
              value={newSocialUrl}
              onChange={(e) => setNewSocialUrl(e.target.value)}
            />
            <Button onClick={() => {
              if (newSocialName && newSocialUrl) {
                setEditedContent({
                  ...editedContent,
                  socialNetworks: [...editedContent.socialNetworks, { name: newSocialName, url: newSocialUrl }]
                });
                setNewSocialName('');
                setNewSocialUrl('');
              }
            }}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {editedContent.socialNetworks.map((social, i) => (
              <div key={i} className="flex items-center gap-2">
                <span>{social.name}:</span>
                <a href={social.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {social.url}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Dossier File */}
        <div className="space-y-2">
          <Label>{t('owner.dossier')}</Label>
          <div className="flex items-center gap-4">
            {editedContent.dossierFile ? (
              <a 
                href={editedContent.dossierFile} 
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
            <Input type="file" accept=".pdf" onChange={handlePdfUpload} className="w-auto" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>{t('channel.cancel')}</Button>
          <Button onClick={() => onSave(editedContent)}>
            <Save className="w-4 h-4 mr-2" />
            {t('channel.save')}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-8">
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="w-4 h-4 mr-2" />
            {t('channel.edit')}
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Photo */}
        {content.photo && (
          <div className="w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0">
            <img src={content.photo} alt={content.fullName} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 space-y-4">
          {content.fullName && (
            <div>
              <span className="text-sm text-muted-foreground">{t('owner.fullName')}</span>
              <p className="text-lg font-semibold">{content.fullName}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {content.birthDate && (
              <div>
                <span className="text-sm text-muted-foreground">{t('owner.birthDate')}</span>
                <p>{content.birthDate}</p>
              </div>
            )}
            {content.birthPlace && (
              <div>
                <span className="text-sm text-muted-foreground">{t('owner.birthPlace')}</span>
                <p>{content.birthPlace}</p>
              </div>
            )}
          </div>

          {content.residence && (
            <div>
              <span className="text-sm text-muted-foreground">{t('owner.residence')}</span>
              <p>{content.residence}</p>
            </div>
          )}

          {content.phone && (
            <div>
              <span className="text-sm text-muted-foreground">{t('owner.phone')}</span>
              <p>{content.phone}</p>
            </div>
          )}

          {content.mediaActivity.text && (
            <div>
              <span className="text-sm text-muted-foreground">{t('owner.mediaActivity')}</span>
              <p className="mt-1">{content.mediaActivity.text}</p>
              {content.mediaActivity.links.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {content.mediaActivity.links.map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      {link}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {content.mediaResources.text && (
            <div>
              <span className="text-sm text-muted-foreground">{t('owner.mediaResources')}</span>
              <p className="mt-1">{content.mediaResources.text}</p>
            </div>
          )}

          {content.socialNetworks.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">{t('owner.socialNetworks')}</span>
              <div className="flex flex-wrap gap-3 mt-2">
                {content.socialNetworks.map((social, i) => (
                  <a 
                    key={i} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-secondary rounded-lg text-sm hover:bg-secondary/80"
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {content.dossierFile && (
            <div>
              <span className="text-sm text-muted-foreground">{t('owner.dossier')}</span>
              <a 
                href={content.dossierFile}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 mt-2 text-primary hover:underline"
              >
                <FileText className="w-5 h-5" />
                PDF Document
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Overview Tab Component
function OverviewTab({
  content,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: {
  content: { blocks: OverviewBlock[] };
  isEditing: boolean;
  onEdit: () => void;
  onSave: (content: { blocks: OverviewBlock[] }) => void;
  onCancel: () => void;
}) {
  const { t, language } = useLanguage();
  const { isAdmin, uploadImage } = useAuth();
  const [editedContent, setEditedContent] = useState(content);

  const addBlock = () => {
    setEditedContent({
      blocks: [...editedContent.blocks, { id: Date.now().toString(), title: '', content: '', images: [] }]
    });
  };

  const updateBlock = (id: string, updates: Partial<OverviewBlock>) => {
    setEditedContent({
      blocks: editedContent.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
    });
  };

  const deleteBlock = (id: string) => {
    setEditedContent({
      blocks: editedContent.blocks.filter(b => b.id !== id)
    });
  };

  const handleImageUpload = async (blockId: string, file: File) => {
    const url = await uploadImage(file);
    const block = editedContent.blocks.find(b => b.id === blockId);
    if (block) {
      updateBlock(blockId, { images: [...block.images, url] });
    }
  };

  if (isEditing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {editedContent.blocks.map((block) => (
          <div key={block.id} className="glass rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <Input
                placeholder={t('overview.blockTitle')}
                value={block.title}
                onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                className="font-semibold text-lg"
              />
              <Button variant="ghost" size="sm" onClick={() => deleteBlock(block.id)} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              placeholder={t('overview.blockContent')}
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              rows={4}
            />
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(block.id, e.target.files[0])}
                className="mb-2"
              />
              <div className="flex flex-wrap gap-2">
                {block.images.map((img, i) => (
                  <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        ))}

        <Button onClick={addBlock} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          {t('overview.addBlock')}
        </Button>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>{t('channel.cancel')}</Button>
          <Button onClick={() => onSave(editedContent)}>
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

      {content.blocks.map((block) => (
        <div key={block.id} className="glass rounded-2xl p-6">
          {block.title && <h3 className="text-xl font-semibold mb-4">{block.title}</h3>}
          <p className="text-foreground/80 whitespace-pre-wrap">{block.content}</p>
          {block.images.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {block.images.map((img, i) => (
                <img key={i} src={img} alt="" className="max-w-xs rounded-lg" />
              ))}
            </div>
          )}
        </div>
      ))}

      {content.blocks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
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
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>{t('tab.addTab')}</DialogTitle>
          <DialogDescription>
            {language === 'uk' ? 'Створіть нову вкладку для каналу' : 'Create a new tab for the channel'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{language === 'uk' ? 'Назва вкладки' : 'Tab name'}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Owner" />
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
