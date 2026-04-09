'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { revalidateTaverns } from '@/lib/actions';
import type { Tavern } from '@/lib/tavern-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Star,
  MapPin,
  Youtube,
  Facebook,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// Available tags
const AVAILABLE_TAGS = [
  'Hidden Gem',
  'Cold Beer',
  'Great Wings',
  'Historic Spot',
  'Best Atmosphere',
  'Small Town Stop',
  'Road Trip Worthy',
  'Live Music',
  'Local Legend',
  'Dive Bar',
];

// Available regions (will expand for US)
const REGIONS = [
  'Northeast Ohio',
  'Southeast Ohio',
  'Central Ohio',
  'South Ohio',
  'Northwest Ohio',
  'Southwest Ohio',
];

interface FormData {
  name: string;
  slug: string;
  city: string;
  county: string;
  state: string;
  region: string;
  address: string;
  latitude: string;
  longitude: string;
  thumbnail: string;
  short_description: string;
  long_description: string;
  tags: string[];
  video_title: string;
  video_url: string;
  video_platform: 'youtube' | 'tiktok' | 'facebook';
  featured: boolean;
  dude_approved: boolean;
  rating: string;
  stop_number: string;
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export default function EditStopPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tavernId = params.id as string;

  const [tavern, setTavern] = useState<Tavern | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
    }
  }, [user, router]);

  // Load tavern from Supabase
  useEffect(() => {
    const loadTavern = async () => {
      if (!tavernId) return;
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('taverns')
        .select('*')
        .eq('id', tavernId)
        .single();

      if (error) {
        console.error('Error loading tavern:', error);
        router.push('/admin/dashboard');
        return;
      }

      if (data) {
        setTavern(data);
        setFormData({
          name: data.name,
          slug: data.slug,
          city: data.city,
          county: data.county || '',
          state: data.state,
          region: data.region,
          address: data.address,
          latitude: data.latitude.toString(),
          longitude: data.longitude.toString(),
          thumbnail: data.thumbnail || '',
          short_description: data.short_description,
          long_description: data.long_description || '',
          tags: data.tags || [],
          video_title: data.video_title || '',
          video_url: data.video_url || '',
          video_platform: data.video_platform || 'youtube',
          featured: data.featured,
          dude_approved: data.dude_approved,
          rating: data.rating?.toString() || '0',
          stop_number: data.stop_number?.toString() || '',
        });
      }
      setIsLoading(false);
    };

    if (user) {
      loadTavern();
    }
  }, [tavernId, user, router]);

  if (!user) {
    return null;
  }

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-amber" />
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
    // Clear error
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const toggleTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tag)
        ? formData.tags.filter((t) => t !== tag)
        : [...formData.tags, tag],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.latitude) newErrors.latitude = 'Latitude is required';
    if (!formData.longitude) newErrors.longitude = 'Longitude is required';
    if (isNaN(parseFloat(formData.latitude))) newErrors.latitude = 'Latitude must be a number';
    if (isNaN(parseFloat(formData.longitude))) newErrors.longitude = 'Longitude must be a number';
    if (!formData.short_description.trim()) newErrors.short_description = 'Short description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSaving(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('taverns')
        .update({
          name: formData.name,
          slug: formData.slug,
          city: formData.city,
          county: formData.county,
          state: formData.state,
          region: formData.region,
          address: formData.address,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          thumbnail: formData.thumbnail || '/images/tavern-placeholder.jpg',
          short_description: formData.short_description,
          long_description: formData.long_description,
          tags: formData.tags,
          video_title: formData.video_title,
          video_url: formData.video_url,
          video_platform: formData.video_platform,
          featured: formData.featured,
          dude_approved: formData.dude_approved,
          rating: parseFloat(formData.rating) || 0,
          stop_number: parseInt(formData.stop_number) || null,
        })
        .eq('id', tavernId);

      if (error) {
        console.error('Error updating tavern:', error);
        setErrors({ name: error.message });
        setIsSaving(false);
        return;
      }

      setShowSuccess(true);
      // Revalidate homepage so edits appear on map immediately
      await revalidateTaverns();
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error updating tavern:', error);
      setErrors({ name: 'An error occurred. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-sm shadow-lg animate-in slide-in-from-top">
          <CheckCircle className="w-5 h-5" />
          Tavern updated successfully!
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <button className="p-2 hover:bg-secondary rounded-sm transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Edit Stop</h1>
              <p className="text-sm text-muted-foreground mt-1">{tavern?.name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Location Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Location Details
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Name *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-destructive text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Slug *</label>
                <Input
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className={errors.slug ? 'border-destructive' : ''}
                />
                {errors.slug && <p className="text-destructive text-xs mt-1">{errors.slug}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">City *</label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={errors.city ? 'border-destructive' : ''}
                />
                {errors.city && <p className="text-destructive text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">County</label>
                <Input
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">State *</label>
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="OH"
                  className={errors.state ? 'border-destructive' : ''}
                />
                {errors.state && <p className="text-destructive text-xs mt-1">{errors.state}</p>}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-foreground mb-2">Region</label>
              <Select value={formData.region} onValueChange={(value) => {
                setFormData({ ...formData, region: value });
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-foreground mb-2">Address</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Latitude *</label>
                <Input
                  name="latitude"
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className={errors.latitude ? 'border-destructive' : ''}
                />
                {errors.latitude && (
                  <p className="text-destructive text-xs mt-1">{errors.latitude}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Longitude *</label>
                <Input
                  name="longitude"
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className={errors.longitude ? 'border-destructive' : ''}
                />
                {errors.longitude && (
                  <p className="text-destructive text-xs mt-1">{errors.longitude}</p>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Details</h2>

            <div className="mb-6">
              <label className="block text-sm font-bold text-foreground mb-2">Thumbnail URL</label>
              <Input
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                placeholder="/images/tavern-x.jpg"
              />
              {formData.thumbnail && (
                <div className="mt-2 relative w-32 h-20 rounded overflow-hidden">
                  <Image
                    src={formData.thumbnail}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-foreground mb-2">Short Description *</label>
              <Textarea
                name="short_description"
                value={formData.short_description}
                onChange={handleInputChange}
                rows={2}
                className={errors.short_description ? 'border-destructive' : ''}
              />
              {errors.short_description && (
                <p className="text-destructive text-xs mt-1">{errors.short_description}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-foreground mb-2">Long Description</label>
              <Textarea
                name="long_description"
                value={formData.long_description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-foreground mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-amber text-darker-wood'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Rating (0-5)</label>
                <Input
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Stop Number</label>
                <Input
                  name="stop_number"
                  type="number"
                  value={formData.stop_number}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="dude_approved"
                  checked={formData.dude_approved}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-amber"
                />
                <span className="text-sm font-bold text-amber flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Dude Approved
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="text-sm font-bold text-foreground flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Featured Stop
                </span>
              </label>
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Video</h2>

            <div className="mb-6">
              <label className="block text-sm font-bold text-foreground mb-2">Video Title</label>
              <Input
                name="video_title"
                value={formData.video_title}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-foreground mb-2">Video URL</label>
              <Input
                name="video_url"
                value={formData.video_url}
                onChange={handleInputChange}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Platform</label>
              <Select
                value={formData.video_platform}
                onValueChange={(value: 'youtube' | 'tiktok' | 'facebook') => {
                  setFormData({ ...formData, video_platform: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">
                    <div className="flex items-center gap-2">
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </div>
                  </SelectItem>
                  <SelectItem value="tiktok">
                    <div className="flex items-center gap-2">
                      <TikTokIcon className="w-4 h-4" />
                      TikTok
                    </div>
                  </SelectItem>
                  <SelectItem value="facebook">
                    <div className="flex items-center gap-2">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/admin/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-sm bg-amber hover:bg-amber/90 text-background font-bold transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
