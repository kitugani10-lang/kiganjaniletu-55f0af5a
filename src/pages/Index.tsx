import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import CreatePostDialog from '@/components/CreatePostDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText, MessageSquare } from 'lucide-react';

interface PostData {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: { id: string; username: string; is_verified?: boolean };
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
  image_urls?: string[];
  category?: string;
}

const POSTS_PER_PAGE = 30;

const Index = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const fetchPosts = useCallback(async () => {
    const { data: postsData } = await supabase
      .from('posts')
      .select('*, author:profiles!posts_author_id_fkey(id, username, is_verified)')
      .order('created_at', { ascending: false });

    if (!postsData) { setLoading(false); return; }

    const postIds = postsData.map(p => p.id);

    const { data: likesData } = await supabase.from('likes').select('post_id, user_id').in('post_id', postIds.length > 0 ? postIds : ['none']);
    const { data: commentsData } = await supabase.from('comments').select('post_id').in('post_id', postIds.length > 0 ? postIds : ['none']);

    const enriched: PostData[] = postsData.map((p: any) => ({
      id: p.id, title: p.title, content: p.content, created_at: p.created_at,
      author: p.author, image_urls: p.image_urls || [], category: p.category,
      likes_count: likesData?.filter(l => l.post_id === p.id).length || 0,
      comments_count: commentsData?.filter(c => c.post_id === p.id).length || 0,
      user_liked: user ? likesData?.some(l => l.post_id === p.id && l.user_id === user.id) || false : false,
    }));

    // Sort: verified authors get a boost, then by engagement + time
    const sorted = [...enriched].sort((a, b) => {
      const VERIFIED_BOOST = 7200000; // 2 hours boost in ms
      const score = (eng: number, time: number, verified: boolean) =>
        time + eng * 3600000 + (verified ? VERIFIED_BOOST : 0);
      return score(b.likes_count + b.comments_count, new Date(b.created_at).getTime(), !!b.author.is_verified)
        - score(a.likes_count + a.comments_count, new Date(a.created_at).getTime(), !!a.author.is_verified);
    });

    setPosts(sorted);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  const filtered = search.trim()
    ? posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()))
    : posts;

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Forum stats
  const totalPosts = posts.filter(p => p.content.length <= 500).length;
  const totalThreads = posts.filter(p => p.content.length > 500).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-6">
        {/* Forum Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="text-lg font-bold">{totalPosts}</p>
              <p className="text-xs text-muted-foreground">Posts (≤500 chars)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <p className="text-lg font-bold">{totalThreads}</p>
              <p className="text-xs text-muted-foreground">Threads (500+ chars)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          {user && <CreatePostDialog onPostCreated={fetchPosts} />}
        </div>

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" />
              </div>
            ))
          ) : visible.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground text-lg">
                {search ? 'No posts match your search.' : 'No posts yet. Be the first to share!'}
              </p>
            </div>
          ) : (
            <>
              {visible.map((post) => <PostCard key={post.id} post={post} onUpdate={fetchPosts} />)}
              {hasMore && (
                <div className="text-center py-4">
                  <Button variant="outline" onClick={() => setVisibleCount(v => v + POSTS_PER_PAGE)}>See More</Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
