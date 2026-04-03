'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { revalidateTaverns } from '@/lib/actions';
import type { Tavern } from '@/lib/tavern-service';
import { Button } from '@/components/ui/button';
import {
  Edit2,
  Trash2,
  Plus,
  LogOut,
  AlertCircle,
  Star,
  MapPin,
  Eye,
  Inbox,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import DudeApprovedBadge from '@/components/dude-approved-badge';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [tavernList, setTavernList] = useState<Tavern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDudeApproved, setFilterDudeApproved] = useState(false);
  const [filterState, setFilterState] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/admin/login');
    }
  }, [user, router]);

  // Load taverns from Supabase
  const loadTaverns = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('taverns')
      .select('*')
      .order('stop_number', { ascending: true });

    if (error) {
      console.error('Error loading taverns:', error);
    } else {
      setTavernList(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadTaverns();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  // Filter taverns
  const filteredTaverns = tavernList.filter((t) => {
    const matchesSearch =
      searchQuery === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDudeApproved = !filterDudeApproved || t.dude_approved;
    const matchesState = !filterState || t.state === filterState;
    return matchesSearch && matchesDudeApproved && matchesState;
  });

  // Get unique states
  const states = Array.from(new Set(tavernList.map((t) => t.state))).sort();

  const handleDeleteTavern = async (id: string) => {
    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from('taverns').delete().eq('id', id);
    
    if (error) {
      console.error('Error deleting tavern:', error);
      alert('Failed to delete tavern: ' + error.message);
    } else {
      setTavernList(tavernList.filter((t) => t.id !== id));
      setSuccessMessage('Tavern deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      // Revalidate homepage so deleted stop disappears from map
      await revalidateTaverns();
    }
    setIsDeleting(false);
    setDeleteConfirm(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-sm shadow-lg animate-in slide-in-from-top">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dude Destination Control Center</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage tavern stops and content ({tavernList.length} stops in database)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadTaverns}
              className="flex items-center gap-2 px-4 py-2 rounded-sm border border-border hover:bg-secondary text-foreground transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-sm bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            href="/admin/nominations"
            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-sm hover:border-amber/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-sm bg-yellow-500/20 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="font-bold text-foreground">Nominations</p>
              <p className="text-xs text-muted-foreground">Review community submissions</p>
            </div>
          </Link>
          <Link
            href="/admin/add-stop"
            className="flex items-center gap-3 px-5 py-4 bg-amber/10 border border-amber/30 rounded-sm hover:bg-amber/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-sm bg-amber/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-amber" />
            </div>
            <div>
              <p className="font-bold text-amber">Add New Stop</p>
              <p className="text-xs text-muted-foreground">Create a new tavern</p>
            </div>
          </Link>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Tavern Stops</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredTaverns.length} of {tavernList.length} stops
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-background border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber"
            />
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-sm text-foreground focus:outline-none focus:border-amber"
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <button
              onClick={() => setFilterDudeApproved(!filterDudeApproved)}
              className={`px-4 py-2 rounded-sm border transition-colors ${
                filterDudeApproved
                  ? 'bg-amber/20 border-amber text-amber'
                  : 'bg-background border-border text-muted-foreground hover:border-amber/50'
              }`}
            >
              {filterDudeApproved ? 'Dude Approved Only' : 'Dude Approved'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-amber" />
          </div>
        ) : filteredTaverns.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No taverns found.</p>
            <Link href="/admin/add-stop">
              <Button className="bg-amber hover:bg-amber/90 text-background">
                Add Your First Stop
              </Button>
            </Link>
          </div>
        ) : (
          /* Tavern Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTaverns.map((tavern) => (
              <div
                key={tavern.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-amber/40 transition-colors group"
              >
                {/* Image */}
                <div className="relative h-48 bg-secondary overflow-hidden">
                  <Image
                    src={tavern.thumbnail || '/images/tavern-placeholder.jpg'}
                    alt={tavern.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {tavern.featured && (
                    <div className="absolute top-2 right-2 bg-amber text-background px-2 py-1 rounded-sm text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-background/90 text-foreground px-2 py-1 rounded-sm text-xs font-bold">
                    Stop #{tavern.stop_number}
                  </div>
                  {tavern.dude_approved && (
                    <div className="absolute bottom-2 left-2">
                      <DudeApprovedBadge size="sm" variant="card" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-foreground text-lg mb-1">{tavern.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {tavern.city}, {tavern.state} - {tavern.region}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber mt-0.5 flex-shrink-0" />
                      <div className="text-muted-foreground">
                        <div className="line-clamp-1">{tavern.address}</div>
                        <div className="text-xs">
                          {tavern.latitude.toFixed(4)}, {tavern.longitude.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-yellow-500 text-sm font-bold">{tavern.rating}</div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`text-xs ${
                            i < Math.floor(Number(tavern.rating))
                              ? 'text-yellow-500'
                              : 'text-border'
                          }`}
                        >
                          ★
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link href={`/admin/edit-stop/${tavern.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(tavern.id)}
                      className="px-3 py-2 rounded-sm border border-border hover:bg-destructive/10 hover:border-destructive text-foreground transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link href={`/taverns/${tavern.slug}`}>
                      <button className="px-3 py-2 rounded-sm border border-border hover:bg-secondary text-foreground transition-colors flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <h3 className="text-lg font-bold">Delete Stop?</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              This will permanently remove{' '}
              <span className="font-bold text-foreground">
                {tavernList.find((t) => t.id === deleteConfirm)?.name}
              </span>{' '}
              from the database. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-sm border border-border hover:bg-secondary text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTavern(deleteConfirm)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-sm bg-destructive hover:bg-destructive/90 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
