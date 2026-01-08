import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Label, TextInput, Textarea, Select, Button, Alert, Spinner } from 'flowbite-react';
import api from '../lib/api';
import { Category, Tag, Post } from '../types';
import CloudinaryUpload from '../components/CloudinaryUpload';
import AddressSelect from '../components/AddressSelect';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';

const PostFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [address, setAddress] = useState({
    provinceCode: '',
    provinceName: '',
    districtCode: '',
    districtName: '',
    neighbourhoodName: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          api.get<Category[]>('/categories'),
          api.get<Tag[]>('/tags'),
        ]);
        setCategories(categoriesRes.data);
        setTags(tagsRes.data);

        if (isEdit) {
          const postRes = await api.get<Post>(`/my/posts/${id}`);
          const post = postRes.data;
          setTitle(post.title);
          setDescription(post.description);
          setCategoryId(post.category?.id?.toString() || '');
          setSelectedTags(post.tags?.map((t) => t.id) || []);
          setImageUrl(post.imageUrl || '');
          setAddress({
            provinceCode: post.provinceCode,
            provinceName: post.provinceName,
            districtCode: post.districtCode,
            districtName: post.districtName,
            neighbourhoodName: post.neighbourhoodName,
          });
        }
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        const updateData = {
          title,
          description,
          categoryId: parseInt(categoryId),
          imageUrl: imageUrl || undefined,
          ...address,
        };
        await api.patch(`/posts/${id}`, updateData);
        await api.put(`/posts/${id}/tags`, { tagIds: selectedTags });
      } else {
        const createData = {
          title,
          description,
          categoryId: parseInt(categoryId),
          imageUrl: imageUrl || undefined,
          ...address,
          tagIds: selectedTags,
        };
        await api.post('/posts', createData);
      }

      navigate('/my/posts');
    } catch (err: any) {
      setError(err.response?.data?.message || 'İlan kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // Live Preview Post objesi
  const previewPost = useMemo((): Post => ({
    id: id ? parseInt(id) : 0,
    title: title || 'İlan Başlığı',
    description: description || 'İlan açıklaması buraya gelecek...',
    imageUrl: imageUrl || '',
    status: 'PENDING',
    provinceCode: address.provinceCode,
    provinceName: address.provinceName || 'İl',
    districtCode: address.districtCode,
    districtName: address.districtName || 'İlçe',
    neighbourhoodName: address.neighbourhoodName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: categories.find(c => c.id === parseInt(categoryId)) || { id: 0, name: 'Kategori' },
    tags: tags.filter(t => selectedTags.includes(t.id)),
    owner: user ? { id: user.id, name: user.name } : { id: 0, name: 'Kullanıcı' },
  }), [id, title, description, imageUrl, address, categoryId, selectedTags, categories, tags, user]);

  if (user?.isBanned) {
    return (
      <Alert color="failure">
        Hesabınız yasaklandığı için ilan oluşturamazsınız.
      </Alert>
    );
  }

  if (initialLoading) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/5">
        <div className="bg-gradient-to-r from-brand-orange to-brand-green px-6 py-5">
          <div className="flex items-center gap-3">
            <img src="/images/logo-icon.png" alt="" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {isEdit ? 'İlanı Düzenle' : 'Yeni İlan Oluştur'}
              </h1>
              <p className="text-sm text-white/90 mt-0.5">
                {isEdit ? 'İlan bilgilerinizi güncelleyin.' : 'Kayıp veya sahiplendirme ilanı oluşturun.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert color="failure" className="mb-4" onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Split Layout: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol: Form */}
        <div className="bg-white rounded-2xl shadow-soft ring-1 ring-black/5 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" value="Başlık *" />
            <TextInput
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={5}
              placeholder="İlan başlığı..."
            />
          </div>

          <div>
            <Label htmlFor="description" value="Açıklama *" />
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              minLength={10}
              placeholder="Detaylı açıklama..."
            />
          </div>

          <div>
            <Label htmlFor="category" value="İlan Tipi *" />
            <Select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Seçin</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label value="Etiketler" className="text-lg font-semibold" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
              {/* Tür */}
              <div>
                <span className="text-sm font-medium text-gray-600 mb-2 block">Tür</span>
                <div className="flex flex-wrap gap-2">
                  {tags.filter(t => ['Kedi', 'Köpek', 'Kuş', 'Tavşan', 'Diğer'].includes(t.name)).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedTags.includes(tag.id)
                          ? 'bg-brand-orange text-white ring-2 ring-brand-orange'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 ring-1 ring-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Yaş */}
              <div>
                <span className="text-sm font-medium text-gray-600 mb-2 block">Yaş</span>
                <div className="flex flex-wrap gap-2">
                  {tags.filter(t => ['Yavru', 'Yaşlı'].includes(t.name)).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedTags.includes(tag.id)
                          ? 'bg-amber-500 text-white ring-2 ring-amber-500'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 ring-1 ring-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Durum */}
              <div>
                <span className="text-sm font-medium text-gray-600 mb-2 block">Durum</span>
                <div className="flex flex-wrap gap-2">
                  {tags.filter(t => ['Yaralı', 'Hasta'].includes(t.name)).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedTags.includes(tag.id)
                          ? 'bg-rose-500 text-white ring-2 ring-rose-500'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 ring-1 ring-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Veteriner */}
              <div>
                <span className="text-sm font-medium text-gray-600 mb-2 block">Veteriner</span>
                <div className="flex flex-wrap gap-2">
                  {tags.filter(t => ['Kısır', 'Aşılı'].includes(t.name)).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedTags.includes(tag.id)
                          ? 'bg-brand-green text-white ring-2 ring-brand-green'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 ring-1 ring-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* İhtiyaç */}
              <div>
                <span className="text-sm font-medium text-gray-600 mb-2 block">İhtiyaç</span>
                <div className="flex flex-wrap gap-2">
                  {tags.filter(t => ['Acil', 'Mama', 'Tedavi', 'Geçici Yuva'].includes(t.name)).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedTags.includes(tag.id)
                          ? 'bg-purple-500 text-white ring-2 ring-purple-500'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 ring-1 ring-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <AddressSelect {...address} onChange={setAddress} />

          <CloudinaryUpload onUpload={setImageUrl} currentUrl={imageUrl} />

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-brand-orange hover:bg-brand-orangeDark text-white"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Kaydediliyor...
                </>
              ) : isEdit ? (
                'Güncelle'
              ) : (
                'Oluştur'
              )}
            </Button>
            <Button 
              type="button" 
              color="gray" 
              onClick={() => navigate('/my/posts')} 
              disabled={loading}
            >
              İptal
            </Button>
          </div>
        </form>
        </div>

        {/* Sağ: Canlı Önizleme */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <div className="bg-white rounded-2xl shadow-soft ring-1 ring-black/5 p-4 mb-4">
              <h3 className="text-sm font-bold text-brand-ink mb-1">Canlı Önizleme</h3>
              <p className="text-xs text-gray-500">İlanınız böyle görünecek</p>
            </div>
            <div className="pointer-events-none">
              <PostCard post={previewPost} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostFormPage;
