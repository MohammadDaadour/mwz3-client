"use client"

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useContext, ChangeEvent } from 'react';
import {
  getPostByIdAction,
  createBlogCommentAction,
  updateBlogCommentAction,
  deleteBlogCommentAction,
  deleteBlogCommentAdminAction,
  updatePostAction,
  deletePostAction,
  deletePostAdminAction,
  deletePostImageAction
} from '@/libs/actions';
import { Post, Comment } from '@/interfaces';
import { ProfileImage } from '@/components/ProfilePicture';
import { AppContext } from '@/providers';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { Button } from '@mantine/core';
import { getPostImages } from '@/components/GetPostImage';
import useSWR, { mutate } from "swr";
import { uploadPostImagesAction } from '@/libs/actions';
import { publicFetcher } from '@/libs/functions';
import ImageSlider from '@/components/ImageSlider';
import ImageUpload from '@/components/ImageUpload';
import ServerImage from '@/components/ServerImage';

export default function PostDetailsPage() {
  const labels = {
    en: {
      post: 'Post',
      reply: 'Reply',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      loginRequiredTitle: 'Login Required',
      loginRequiredMessage: 'Please login to interact with comments.',
      viewReplies: "View replies",
      hideReplies: "Hide replies"

    },
    ar: {
      post: 'نشر',
      reply: 'رد',
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      loginRequiredTitle: 'تسجيل الدخول مطلوب',
      loginRequiredMessage: 'يرجى تسجيل الدخول للتفاعل مع التعليقات.',
      viewReplies: "عرض الردود",
      hideReplies: "إخفاء الردود"
    },
  };

  const { id } = useParams<any>();
  const postId = Number(id);

  const { locale } = useParams<any>();
  const lang = locale === 'ar' ? 'ar' : 'en';
  const t = labels[lang];

  const context = useContext(AppContext);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const isActive = commentContent.trim().length > 0;
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [openReplies, setOpenReplies] = useState<Set<number>>(new Set());
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingPostTitle, setEditingPostTitle] = useState('');
  const [editingPostContent, setEditingPostContent] = useState('');
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState('');

  const menuRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const toggleMenu = (id: number) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const toggleReplies = (commentId: number) => {
    setOpenReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleUpdatePost = async (postId: number, title: string, content: string) => {
    try {
      await updatePostAction(postId, title, content);
      await refreshPost();
      setEditingPostId(null);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePostAction(postId);
      window.location.href = `/${locale}/blog`;
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDeletePostAdmin = async (postId: number) => {
    try {
      await deletePostAdminAction(postId)
      window.location.href = `/${locale}/blog`;
    } catch (error) {
      console.error('Error deleting post:', error);

    }
  }

  const refreshPost = async () => {
    try {
      const data = await getPostByIdAction(postId);
      setPost(data);
    } catch (error) {
      console.error('Error refreshing post:', error);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await getPostByIdAction(postId);
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId === null) return;

      const menuRef = menuRefs.current.get(openMenuId);
      if (menuRef && !menuRef.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const handleCreateComment = async () => {
    if (context.user.id == 0) {
      notifications.show({
        title: t.loginRequiredTitle,
        message: t.loginRequiredMessage,
        color: 'red',
      });
    }
    try {
      await createBlogCommentAction(postId, commentContent);
      setCommentContent('');
      await refreshPost();
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleCreateReply = async (parentId: number) => {
    if (context.user.id == 0) {
      notifications.show({
        title: t.loginRequiredTitle,
        message: t.loginRequiredMessage,
        color: 'red',
      });
    }
    try {
      await createBlogCommentAction(postId, replyContent, parentId);
      setReplyContent('');
      setReplyingToId(null);
      await refreshPost();
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleUpdateComment = async (commentId: number, content: string) => {
    try {
      await updateBlogCommentAction(commentId, content);

      setPost(prevPost => {
        if (!prevPost) return prevPost;

        const updatedComments = prevPost.comments.map((comment: any) => {
          if (comment.id === commentId) {
            return { ...comment, content };
          }
          return comment;
        });

        return { ...prevPost, comments: updatedComments };
      });

      setEditingCommentId(null);
      setEditingContent('');

    } catch (error) {
      console.error('Error updating comment:', error);
      await refreshPost();
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteBlogCommentAction(commentId);
      await refreshPost();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeleteCommentAdmin = async (commentId: number) => {
    try {
      await deleteBlogCommentAdminAction(commentId)
      await refreshPost();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }

  const handleUpdateReply = async (replyId: number, content: string) => {
    try {
      await updateBlogCommentAction(replyId, content);
      await refreshPost();
      setEditingReplyId(null);
    } catch (error) {
      console.error('Error updating reply:', error);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    try {
      await deleteBlogCommentAction(replyId);
      await refreshPost();
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  const handleDeleteReplyAdmin = async (replyId: number) => {
    try {
      await deleteBlogCommentAdminAction(replyId);
      await refreshPost();
    } catch (error) {
      console.error('Error deleting reply as admin:', error);
    }
  };

  const { data: images } = useSWR<{ id: string, url: string, mime: string }[]>(
    `${process.env.API_URL}/images/posts/${post?.id}`,
    publicFetcher
  );

  const handleImageDelete = async (imageId: string) => {
    try {
      if (!post) {
        return;
      }
      await deletePostImageAction(imageId);
      mutate(`${process.env.API_URL}/images/posts/${post.id}`);
    }
    catch (err) {
      console.error('image could not be deleted.', err)
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Post Content */}
      <div className="border p-4 rounded mb-6">
        <div className='flex justify-between'>
          <Link href={`/blog/user/${post?.user?.id}`}>
            <div className='flex items-center'>
              <ProfileImage
                source={
                  post.user?.id && post.user?.image
                    ? `${process.env.API_URL}/images/users/${post.user.id}/${post.user.image}`
                    : undefined
                }
                height={38}
                width={38}
              />
              <h1 className="text-xl font-bold mb-2 mx-2">{post.user?.label}</h1>
            </div>
          </Link>
          <div className="relative"
            ref={(el) => {
              if (el) menuRefs.current.set(post.id, el);
              else menuRefs.current.delete(post.id);
            }}>
            <button
              className={`hover:bg-stone-700 rounded-full duration-200 p-2 px-4 ${context.user.id === post.userId ||
                context.user.role === 'admin' ? '' : 'hidden'
                }`}
              onClick={() => toggleMenu(post.id)}
            >
              ⋮
            </button>
            {openMenuId === post.id && (
              <div className="absolute left-2 w-28 bg-stone-900 border border-stone-700 shadow-lg z-10">
                {(context.user.id === post.userId) && (
                  <button
                    className="text-white w-full text-left hover:bg-stone-700 p-4 py-2"
                    onClick={() => {
                      setEditingPostId(post.id);
                      setEditingPostTitle(post.title);
                      setEditingPostContent(post.content);
                      setOpenMenuId(null);
                    }}
                  >
                    {t.edit}
                  </button>
                )}
                {context.user.role === 'admin' ?
                  (<button
                    className="text-white w-full text-left hover:bg-stone-700 p-4 py-2"
                    onClick={() => {
                      handleDeletePostAdmin(post.id);
                      setOpenMenuId(null);
                    }}
                  >
                    {t.delete}
                  </button>) :
                  (
                    <button
                      className="text-white w-full text-left hover:bg-stone-700 p-4 py-2"
                      onClick={() => {
                        handleDeletePost(post.id);
                        setOpenMenuId(null);
                      }}
                    >
                      {t.delete}
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
        <div className='flex w-full justify-between items-center'>
          {editingPostId === post.id ? (
            <div className="w-full">
              <input
                type="text"
                className="text-2xl font-bold mb-2 mt-4 w-full p-2 border rounded"
                value={editingPostTitle}
                onChange={(e) => setEditingPostTitle(e.target.value)}
              />
              <textarea
                className="w-full p-2 border rounded"
                value={editingPostContent}
                onChange={(e) => setEditingPostContent(e.target.value)}
                rows={4}
              />
              <div className='flex flex-wrap justify-around'>
                {images && images.map((img) => (
                  <div className='relative flex flex-col justify-center items-center' key={img.id}>
                    <ServerImage
                      key={img.id}
                      postId={post.id.toString()}
                      imageId={img.id}
                      alt=""
                      className="w-[150px] mt-2"
                      loading="lazy"
                    />
                    <button className='absolute right-1 top-1 m-0 bg-red-600 text-white w-1/4' onClick={() => handleImageDelete(img.id)}>X</button>
                  </div>
                ))}
              </div>

              <ImageUpload postId={post.id} />
              تعديل الصور يتم تلقائيا
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => handleUpdatePost(post.id, editingPostTitle, editingPostContent)}
                  color="blue"
                >
                  {t.save}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingPostId(null)}
                >
                  {t.cancel}
                </Button>
              </div>
            </div>
          ) : (
            <div className='flex flex-col'>
              {images && images.length > 0 && <ImageSlider images={images} postId={postId.toString()} />}
              <h1 className="text-2xl font-bold mb-2 mt-4 mx-2">{post.title}</h1>
            </div>
          )}
        </div>

        {editingPostId !== post.id && (
          <p className='mx-2'>{post.content}</p>
        )}
      </div>

      <div className="mb-4">
        <textarea
          className="w-full border rounded p-2"
          placeholder="Write a comment..."
          value={commentContent}
          onChange={(e) => { setCommentContent(e.target.value); }}
        />
        <button
          className={`mt-2 bg-amber-600 text-white px-4 py-2 rounded ${isActive ? 'hover:bg-amber-700' : 'opacity-50 cursor-default pointer-events-none'}`}
          disabled={!isActive}
          onClick={handleCreateComment}
        >
          {t.post}
        </button>
      </div>

      {post?.comments.map((comment: Comment) => (
        <div key={comment.id} className="border-t pt-4 mt-4">
          <div className="flex justify-between items-start">
            <div>
              <Link href={`/blog/user/${comment.userId}`}>
                <div className='flex items-center'>
                  <ProfileImage
                    source={
                      comment.user?.image ? `${process.env.API_URL}/images/users/${comment?.user?.id}/${comment?.user?.image}` : undefined
                    }
                    height={38}
                    width={38}
                  />
                  <strong className='m-2'>{comment.user?.label || null}</strong>
                </div>
              </Link>
              {editingCommentId === comment.id ? (
                <>
                  <textarea
                    className="w-full border rounded p-2 mt-2"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2 ">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => handleUpdateComment(comment.id, editingContent)}
                    >
                      {t.save}
                    </button>
                    <button
                      className="bg-gray-500 text-white px-3 py-1 rounded"
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditingContent('');
                      }}
                    >
                      {t.cancel}
                    </button>
                  </div>
                </>
              ) : (
                <p className='break-all'>{comment?.content}</p>
              )}

              {replyingToId === comment.id ? (
                <div className="mt-3">
                  <textarea
                    className="w-full border rounded p-2"
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      className={`bg-amber-700 text-white px-3 py-1 rounded ${replyContent.trim().length > 0 ? 'hover:bg-amber-800' : 'opacity-50 cursor-default pointer-events-none'
                        }`}
                      disabled={replyContent.trim().length === 0}
                      onClick={() => handleCreateReply(comment.id)}
                    >
                      {t.reply}
                    </button>
                    <button
                      className="bg-gray-500 text-white px-3 py-1 rounded"
                      onClick={() => {
                        setReplyingToId(null);
                        setReplyContent('');
                      }}
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="text-stone-400 hover:text-stone-600 text-sm mt-2"
                  onClick={() => setReplyingToId(comment.id)}
                >
                  {t.reply}
                </button>
              )}
            </div>
            <div className="relative"
              ref={(el) => {
                if (el) menuRefs.current.set(comment.id, el);
                else menuRefs.current.delete(comment.id);
              }}>
              <button className={`hover:bg-stone-700 rounded-full duration-200 p-2 px-4 ${context.user.id === comment.userId ? '' : 'hidden'}`}
                onClick={() => toggleMenu(comment.id)}>⋮</button>
              {openMenuId === comment.id && (
                <div className="absolute right-0 w-28 bg-stone-900 border border-stone-700 shadow-lg z-10">
                  <button
                    className="text-white w-full text-left hover:bg-stone-700 p-4 py-2"
                    onClick={() => {
                      handleDeleteComment(comment.id);
                      setOpenMenuId(null);
                    }}
                  >
                    {t.delete}
                  </button>
                  <button
                    className="text-white w-full text-left hover:bg-stone-700 p-4 py-2"
                    onClick={() => {
                      setEditingCommentId(comment.id);
                      setEditingContent(comment.content);
                      setOpenMenuId(null);
                    }}
                  >
                    {t.edit}
                  </button>
                  <button
                    className="text-white w-full text-left hover:bg-stone-700 p-4 py-2"
                    onClick={() => {
                      setReplyingToId(comment.id);
                      setOpenMenuId(null);
                    }}
                  >
                    {t.reply}
                  </button>
                </div>
              )}
              {(context.user.role == 'admin' || context.user.role == 'su') && (comment.user.type != 'admin' && comment.user.type != 'su') ? <p onClick={() => handleDeleteCommentAdmin(comment.id)} className='w-[50px] mt-2 text-center rounded-full bg-red-600 p-1 cursor-pointer'> {t.delete} </p> : ""}
            </div>

          </div>
          <button
            className={`text-sm text-stone-400 hover:text-stone-600 mb-2 ${comment.replies && comment.replies?.length > 0 ? '' : 'hidden'}`}
            onClick={() => toggleReplies(comment.id)}
          >
            {openReplies.has(comment.id) ? `${t.hideReplies} ▲` : `${t.viewReplies} (${comment.replies?.length}) ▼`}
          </button>
          {openReplies.has(comment.id) && (
            <div className={`mt-2 ml-4 ${lang == 'en' ? 'border-l' : 'border-r'} pl-4`}>
              {comment.replies?.map(reply => (
                <div key={reply.id} className="relative my-4">

                  <div className="flex items-center">
                    <ProfileImage
                      source={
                        reply.user?.id && reply.user?.image
                          ? `${process.env.API_URL}/images/users/${reply.user.id}/${reply.user.image}`
                          : undefined
                      }
                      height={38}
                      width={38}
                    />
                    <div className="mx-2">
                      <strong className='mx-2'>{reply.user.label}</strong>
                      {editingReplyId === reply.id ? (
                        <>
                          <textarea
                            className="w-full border rounded p-2 mt-1"
                            value={editingReplyContent}
                            onChange={(e) => setEditingReplyContent(e.target.value)}
                          />
                          <div className="flex gap-2 mt-1">
                            <button
                              className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                              onClick={() => handleUpdateReply(reply.id, editingReplyContent)}
                            >
                              {t.save}
                            </button>
                            <button
                              className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                              onClick={() => setEditingReplyId(null)}
                            >
                              {t.cancel}
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm">{reply.content}</p>
                      )}
                    </div>
                  </div>

                  <div className={`absolute top-0 ${lang == 'ar' ? 'left-6' : 'right-0'}`}>
                    <button
                      className={`hover:bg-stone-700 rounded-full duration-200 p-1 ${context.user.id === reply.userId ? '' : 'hidden'}`}
                      onClick={() => toggleMenu(reply.id)}
                    >
                      ⋮
                    </button>

                    {openMenuId === reply.id && (
                      <div className="absolute right-0 w-28 bg-stone-900 border border-stone-700 shadow-lg z-10">
                        <button
                          className="text-white w-full text-left hover:bg-stone-700 p-2 text-sm"
                          onClick={() => {
                            setEditingReplyId(reply.id);
                            setEditingReplyContent(reply.content);
                            setOpenMenuId(null);
                          }}
                        >
                          {t.edit}
                        </button>
                        <button
                          className="text-white w-full text-left hover:bg-stone-700 p-2 text-sm"
                          onClick={() => {
                            handleDeleteReply(reply.id);
                            setOpenMenuId(null);
                          }}
                        >
                          {t.delete}
                        </button>
                      </div>
                    )}

                    {(context.user.role === 'admin' || context.user.role === 'su') &&
                      (reply.user.type !== 'admin' && reply.user.type !== 'su') && (
                        <button
                          onClick={() => handleDeleteReplyAdmin(reply.id)}
                          className="ml-2 bg-red-600 text-white p-1 rounded text-xs"
                          title="Delete as admin"
                        >
                          {t.delete}
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}