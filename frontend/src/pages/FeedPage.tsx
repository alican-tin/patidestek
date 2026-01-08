import React, { useState, useEffect, useCallback } from 'react';
import { Select, Spinner, Alert, Label, TextInput, Pagination, Button } from 'flowbite-react';
import api from '../lib/api';
import { Post, Category, Tag, Province, District, Neighbourhood, PaginatedResponse } from '../types';
import PostCard from '../components/PostCard';
import { HiSearch, HiX } from 'react-icons/hi';

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [neighbourhoods, setNeighbourhoods] = useState<Neighbourhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [categoryId, setCategoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [tagLogic, setTagLogic] = useState<'OR' | 'AND'>('OR');
  const [provinceCode, setProvinceCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [neighbourhoodName, setNeighbourhoodName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesRes, tagsRes, provincesRes] = await Promise.all([
          api.get<Category[]>('/categories'),
          api.get<Tag[]>('/tags'),
          api.get<Province[]>('/locations/provinces'),
        ]);
        setCategories(categoriesRes.data);
        setTags(tagsRes.data);
        setProvinces(provincesRes.data);
      } catch (err) {
        console.error('Failed to load filter data:', err);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setDistrictCode('');
      setNeighbourhoods([]);
      setNeighbourhoodName('');
      return;
    }

    const loadDistricts = async () => {
      try {
        const response = await api.get<District[]>(`/locations/districts?provinceCode=${provinceCode}`);
        setDistricts(response.data);
      } catch (err) {
        console.error('Failed to load districts:', err);
      }
    };
    loadDistricts();
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) {
      setNeighbourhoods([]);
      setNeighbourhoodName('');
      return;
    }

    const loadNeighbourhoods = async () => {
      try {
        const response = await api.get<Neighbourhood[]>(
          `/locations/neighbourhoods?provinceCode=${provinceCode}&districtCode=${districtCode}`
        );
        setNeighbourhoods(response.data);
      } catch (err) {
        console.error('Failed to load neighbourhoods:', err);
      }
    };
    loadNeighbourhoods();
  }, [provinceCode, districtCode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, selectedTags, tagLogic, provinceCode, districtCode, neighbourhoodName, searchQuery]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);
      if (selectedTags.length > 0) {
        params.append('tagIds', selectedTags.join(','));
        params.append('tagLogic', tagLogic);
      }
      if (provinceCode) params.append('provinceCode', provinceCode);
      if (districtCode) params.append('districtCode', districtCode);
      if (neighbourhoodName) params.append('neighbourhoodName', neighbourhoodName);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const response = await api.get<PaginatedResponse<Post>>(`/posts?${params.toString()}`);
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (err) {
      setError('İlanlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [categoryId, selectedTags, tagLogic, provinceCode, districtCode, neighbourhoodName, searchQuery, currentPage]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="mb-8 overflow-hidden rounded-2xl shadow-soft ring-1 ring-black/5 relative">
        <div 
          className="bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/hero.png)' }}
        >
          <div className="bg-gradient-to-r from-brand-orange/90 to-brand-green/80 px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
              <img src="/images/logo-icon.png" alt="" className="h-10 w-10 object-contain" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-sm">
                PatiDestek İlanları
              </h1>
            </div>
            <p className="mt-2 text-sm sm:text-base text-white/95 max-w-lg">
              Kayıp dostunu arayanlar, bulanlar ve yuva olmak isteyenler aynı yerde.
            </p>
          </div>
        </div>
        <div className="px-6 py-3 text-sm text-gray-600 bg-white">
          <span className="font-semibold text-orange-600">Kayıp</span> ilanlarında turuncu, 
          <span className="font-semibold text-green-600"> Sahiplendirme</span> ilanlarında yeşil rozetleri takip et.
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <TextInput
              icon={HiSearch}
              placeholder="Başlık veya açıklamada ara..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <HiX className="w-5 h-5" />
              </button>
            )}
          </div>
          <Button type="submit" className="bg-brand-orange hover:bg-brand-orangeDark text-white">
            Ara
          </Button>
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-2">
            "<strong>{searchQuery}</strong>" için {total} sonuç bulundu
          </p>
        )}
      </form>

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-soft ring-1 ring-black/5 mb-6">
        <h2 className="text-lg font-extrabold text-brand-ink mb-4">Filtreler</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <Label htmlFor="category" value="İlan Tipi" />
            <Select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Tümü</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="province" value="İl" />
            <Select
              id="province"
              value={provinceCode}
              onChange={(e) => setProvinceCode(e.target.value)}
            >
              <option value="">Tümü</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="district" value="İlçe" />
            <Select
              id="district"
              value={districtCode}
              onChange={(e) => setDistrictCode(e.target.value)}
              disabled={!provinceCode}
            >
              <option value="">Tümü</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="neighbourhood" value="Mahalle" />
            <Select
              id="neighbourhood"
              value={neighbourhoodName}
              onChange={(e) => setNeighbourhoodName(e.target.value)}
              disabled={!districtCode}
            >
              <option value="">Tümü</option>
              {neighbourhoods.map((n) => (
                <option key={n.name} value={n.name}>
                  {n.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label value="Etiketler" className="text-lg font-semibold" />
            {selectedTags.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {tagLogic === 'OR' ? 'Herhangi biri' : 'Tümü birden'}
                </span>
                <button
                  type="button"
                  onClick={() => setTagLogic(tagLogic === 'OR' ? 'AND' : 'OR')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    tagLogic === 'AND' ? 'bg-brand-orange' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      tagLogic === 'AND' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-gray-700">
                  {tagLogic === 'OR' ? 'VEYA' : 'VE'}
                </span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

            {/* Yaş & Durum */}
            <div>
              <span className="text-sm font-medium text-gray-600 mb-2 block">Yaş / Durum</span>
              <div className="flex flex-wrap gap-2">
                {tags.filter(t => ['Yavru', 'Yaşlı', 'Yaralı', 'Hasta'].includes(t.name)).map((tag) => (
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

            {/* Veteriner & İhtiyaç */}
            <div>
              <span className="text-sm font-medium text-gray-600 mb-2 block">Veteriner / İhtiyaç</span>
              <div className="flex flex-wrap gap-2">
                {tags.filter(t => ['Kısır', 'Aşılı', 'Acil', 'Mama', 'Tedavi', 'Geçici Yuva'].includes(t.name)).map((tag) => (
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
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="xl" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-soft ring-1 ring-black/5">
          <img src="/images/empty-state.png" alt="İlan bulunamadı" className="w-48 h-48 mx-auto mb-4 object-contain" />
          <p className="text-xl font-bold text-brand-ink">Henüz ilan bulunamadı</p>
          <p className="text-sm text-gray-500 mt-2">Filtreleri değiştirmeyi veya arama terimini temizlemeyi deneyin.</p>
        </div>
      ) : (
        <>
          {/* Results info */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Toplam {total} ilan bulundu (Sayfa {currentPage}/{totalPages})
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showIcons
                previousLabel="Önceki"
                nextLabel="Sonraki"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FeedPage;
