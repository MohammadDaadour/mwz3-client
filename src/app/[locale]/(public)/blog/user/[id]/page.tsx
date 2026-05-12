"use client"

import { useParams } from 'next/navigation';
import { useState, useEffect, useContext } from 'react';
import { getUserPosts } from '@/libs/actions';
import { Post } from '@/interfaces';
import { ProfileImage } from '@/components/ProfilePicture';
import Link from 'next/link';
import { AppContext } from '@/providers';
import { CreatePostModal } from '@/components/CreatePostModal';

const PostsList = () => {
    const labels = {
        en: {
            posts: "'s Posts",
            create: "Create new post",
            noMore: "No more posts",
            none: "There are no posts for this user......"

        },
        ar: {
            posts: "منشورات",
            create: "انشاء منشور جديد",
            noMore: "لا مزيد من المنشورات",
            none: ".....لا تتوفر منشورات لهذا المستخدم"
        },
    };

    const { locale } = useParams<any>();
    const lang = locale === 'ar' ? 'ar' : 'en';
    const t = labels[lang];

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const context = useContext(AppContext);
    const { id } = useParams<any>();
    const userId = Number(id);

    const fetchPosts = async (pageNum = 1, append = false) => {
        setLoading(true);
        setError(null);

        try {
            const response = await getUserPosts(userId, pageNum, 10);

            if (append) {
                setPosts(prev => [...prev, ...response.rows]);
            } else {
                setPosts(response.rows);
            }

            setTotalCount(response.count);
            setHasMore(response.rows.length === 10);

        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(1, false);
    }, []);

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage, true);
        }
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            {posts[0] ? <h1 className='text-3xl p-2'>{posts[0]?.user.label} {t.posts}</h1> : t.none }
            {userId === context.user.id && (context.user.role === "admin" || context.user.role === "su") ? (
                <CreatePostModal onCreated={() => fetchPosts(1, false)} />
            ) : null}
            <div className='flex flex-wrap justify-center'>
                {posts.map(post => (
                    <Link key={post.id} href={`/post/${post.id}`}>
                        <div className='border rounded-md m-2 p-4 w-[350px] sm:w-[400px] h-[200px] hover:bg-stone-700 cursor-pointer
                        duration-200 overflow-hidden from bg-gradient-to-t from-stone-700/80 to-transparent'>
                            <div className='flex items-center'>
                                <ProfileImage
                                    source={
                                        post.user.image ? `${process.env.API_URL}/images/users/${post.user.id}/${post.user.image}` : undefined
                                    }
                                    height={38}
                                    width={38}
                                />
                                <h2 className='text-b mx-2'>{post.user.label}</h2>
                            </div>
                            <h1 className='text-2xl mt-2'>{post.title}</h1>
                            <p className='mt-2 p-2'>{post.content}</p>

                        </div>
                    </Link>
                ))}
            </div>
            {loading && <div>Loading...</div>}

            {hasMore && !loading && (
                <button onClick={loadMore}>
                    Load More
                </button>
            )}

            {!hasMore && posts.length > 0 && (
                <div>{t.noMore}</div>
            )}
        </div>
    );
};

export default PostsList;