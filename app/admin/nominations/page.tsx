'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  Inbox,
  Check,
  X,
  Clock,
  MapPin,
  User,
  Mail,
  MessageSquare,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface Nomination {
  id: string;
  tavern_name: string;
  city: string;
  state: string;
  reason: string;
  submitter_name: string | null;
  submitter_email: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
}

export default function AdminNominationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedNomination, setSelectedNomination] = useState<Nomination | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNominations();
    }
  }, [isAuthenticated]);

  const fetchNominations = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tavern_nominations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching nominations:', error);
    } else {
      setNominations(data || []);
    }
    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setIsUpdating(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('tavern_nominations')
      .update({
        status,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating nomination:', error);
      alert('Failed to update nomination: ' + error.message);
    } else {
      setNominations(nominations.map(n => 
        n.id === id ? { ...n, status, admin_notes: adminNotes } : n
      ));
      setSelectedNomination(null);
      setAdminNotes('');
    }
    setIsUpdating(false);
  };

  const deleteNomination = async (id: string) => {
    if (!confirm('Are you sure you want to delete this nomination?')) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('tavern_nominations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting nomination:', error);
      alert('Failed to delete nomination: ' + error.message);
    } else {
      setNominations(nominations.filter(n => n.id !== id));
      if (selectedNomination?.id === id) {
        setSelectedNomination(null);
      }
    }
  };

  const filteredNominations = nominations.filter(n => 
    filter === 'all' ? true : n.status === filter
  );

  const counts = {
    all: nominations.length,
    pending: nominations.filter(n => n.status === 'pending').length,
    approved: nominations.filter(n => n.status === 'approved').length,
    rejected: nominations.filter(n => n.status === 'rejected').length,
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-darker-wood/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <button
              onClick={fetchNominations}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-sm bg-amber/20 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-amber" />
            </div>
            <h1 className="font-serif text-3xl font-black text-foreground">
              Tavern Nominations
            </h1>
          </div>
          <p className="text-muted-foreground">
            Review and manage community-submitted tavern recommendations
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-semibold transition-all ${
                filter === status
                  ? status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : status === 'approved'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : status === 'rejected'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-amber/20 text-amber border border-amber/30'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'pending' && <Clock className="w-4 h-4" />}
              {status === 'approved' && <CheckCircle className="w-4 h-4" />}
              {status === 'rejected' && <XCircle className="w-4 h-4" />}
              {status === 'all' && <Inbox className="w-4 h-4" />}
              <span className="capitalize">{status}</span>
              <span className="px-1.5 py-0.5 bg-black/20 rounded text-xs">
                {counts[status]}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nominations List */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber" />
              </div>
            ) : filteredNominations.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-sm">
                <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No {filter !== 'all' ? filter : ''} nominations</p>
              </div>
            ) : (
              filteredNominations.map((nomination) => (
                <div
                  key={nomination.id}
                  onClick={() => {
                    setSelectedNomination(nomination);
                    setAdminNotes(nomination.admin_notes || '');
                  }}
                  className={`bg-card border rounded-sm p-4 cursor-pointer transition-all hover:border-amber/50 ${
                    selectedNomination?.id === nomination.id
                      ? 'border-amber ring-1 ring-amber/30'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground truncate">
                          {nomination.tavern_name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            nomination.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : nomination.status === 'approved'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {nomination.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        {nomination.city}, {nomination.state}
                      </div>
                      <p className="text-sm text-foreground/80 line-clamp-2">
                        {nomination.reason}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {new Date(nomination.created_at).toLocaleDateString()}
                      </p>
                      {nomination.submitter_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          by {nomination.submitter_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedNomination ? (
              <div className="bg-card border border-border rounded-sm p-5 sticky top-24">
                <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                  {selectedNomination.tavern_name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  {selectedNomination.city}, {selectedNomination.state}
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      <MessageSquare className="w-3 h-3" />
                      Why They Recommended It
                    </label>
                    <p className="text-sm text-foreground bg-background p-3 rounded-sm border border-border">
                      {selectedNomination.reason}
                    </p>
                  </div>

                  {selectedNomination.submitter_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedNomination.submitter_name}</span>
                    </div>
                  )}

                  {selectedNomination.submitter_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`mailto:${selectedNomination.submitter_email}`}
                        className="text-amber hover:underline"
                      >
                        {selectedNomination.submitter_email}
                      </a>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes..."
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber/60 resize-none"
                    />
                  </div>
                </div>

                {selectedNomination.status === 'pending' && (
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => updateStatus(selectedNomination.id, 'approved')}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-sm hover:bg-green-500 transition-colors disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(selectedNomination.id, 'rejected')}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-sm hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      Reject
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/admin/add-stop?name=${encodeURIComponent(selectedNomination.tavern_name)}&city=${encodeURIComponent(selectedNomination.city)}&state=${encodeURIComponent(selectedNomination.state)}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber text-darker-wood font-semibold rounded-sm hover:bg-amber-bright transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    Add as Stop
                  </Link>
                  <button
                    onClick={() => deleteNomination(selectedNomination.id)}
                    className="px-3 py-2.5 bg-card border border-border text-red-400 rounded-sm hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-sm p-8 text-center">
                <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  Select a nomination to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
