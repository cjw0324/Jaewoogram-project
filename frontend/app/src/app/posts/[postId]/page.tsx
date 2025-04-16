"use client";

import { JSX, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

interface CommentResponse {
  commentId: number;
  comment: string;
  authorId: number;
  authorNickname: string;
  modifiedAt: string;
  likedByCurrentUser: boolean;
  likeCount: number;
  children: CommentResponse[];
  isAuthor: boolean;
}

interface PostResponse {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorNickname: string;
  updatedAt: string;
  likeCount: number;
  likedByCurrentUser: boolean;
  imageUrls: string[];
  isAuthor: boolean;
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchPost = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${postId}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("게시글 불러오기 실패");
      const data = await res.json();
      setPost(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/comments/${postId}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        console.warn("댓글 형식이 배열이 아님", data);
        setComments([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const handleLike = async () => {
    if (!post || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${postId}/like`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("좋아요 실패");
      const data = await res.json();
      setPost({
        ...post,
        likeCount: data.likeCount,
        likedByCurrentUser: !post.likedByCurrentUser,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("게시글을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${postId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("삭제 실패");
      router.push("/posts");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/comments`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newComment,
            postId: Number(postId),
            parentId: replyTo,
          }),
        }
      );
      if (!res.ok) throw new Error("댓글 작성 실패");
      setNewComment("");
      setReplyTo(null);
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentLike = async (commentId: number | undefined) => {
    if (!commentId) {
      console.error("🚨 commentId is undefined!", commentId);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/comments/${commentId}/like`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("댓글 좋아요 실패");
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("댓글 삭제 실패");
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentUpdate = async () => {
    if (!editingCommentId || !editingContent.trim()) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/comments/${editingCommentId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: editingContent }),
        }
      );
      if (!res.ok) throw new Error("댓글 수정 실패");
      setEditingCommentId(null);
      setEditingContent("");
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextImage = () => {
    if (!post) return;
    setActiveImageIndex((prev) =>
      prev === post.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    if (!post) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? post.imageUrls.length - 1 : prev - 1
    );
  };

  const renderCommentTree = (
    comment: CommentResponse,
    depth: number = 0
  ): JSX.Element => (
    <div key={comment.commentId} className={`ml-${depth > 0 ? 10 : 0} mt-2`}>
      <div className="flex items-start">
        <div
          className={`w-${depth > 0 ? 6 : 8} h-${
            depth > 0 ? 6 : 8
          } bg-gray-200 rounded-full mr-2 flex-shrink-0`}
        >
          <div className="w-full h-full rounded-full flex items-center justify-center text-gray-500 text-xs">
            {comment.authorNickname.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex flex-wrap items-baseline">
            <span className="font-semibold text-sm mr-1">
              <Link
                href={`/users/${comment.authorId}`}
                className="hover:underline"
              >
                {comment.authorNickname}
              </Link>
            </span>
            {editingCommentId === comment.commentId ? (
              <div className="w-full mt-1 mb-2">
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                  rows={2}
                />
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={handleCommentUpdate}
                    className="text-blue-500 text-xs font-medium"
                  >
                    완료
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditingContent("");
                    }}
                    className="text-gray-500 text-xs"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-900">{comment.comment}</span>
            )}
          </div>
          <div className="flex mt-1 text-xs text-gray-500 gap-4">
            <span>{new Date(comment.modifiedAt).toLocaleDateString()}</span>
            <button
              onClick={() => handleCommentLike(comment.commentId)}
              className={comment.likedByCurrentUser ? "text-red-500" : ""}
            >
              좋아요 {comment.likeCount > 0 && comment.likeCount}
            </button>
            <button onClick={() => setReplyTo(comment.commentId)}>
              답글 달기
            </button>
            {comment.isAuthor && (
              <>
                <button
                  onClick={() => {
                    setEditingCommentId(comment.commentId);
                    setEditingContent(comment.comment);
                  }}
                >
                  수정
                </button>
                <button
                  onClick={() => handleCommentDelete(comment.commentId)}
                  className="text-red-500"
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {comment.children && comment.children.length > 0 && (
        <div className="ml-6 border-l-2 border-gray-100 pl-3 mt-2 space-y-2">
          {comment.children.map((child) => renderCommentTree(child, depth + 1))}
        </div>
      )}
    </div>
  );

  const renderComments = (comments: CommentResponse[]) => (
    <div className="space-y-4">
      {comments.map((comment) => renderCommentTree(comment))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">게시글을 불러올 수 없습니다.</div>
        <button
          onClick={() => router.push("/posts")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto bg-white min-h-screen">
        {/* 헤더 */}
        <header className="border-b border-gray-200 px-4 py-3 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <button onClick={() => router.back()} className="text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
            <h1 className="text-base font-semibold">게시글</h1>
            {post.isAuthor && (
              <div className="relative group">
                <button className="text-black">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                  <Link
                    href={`/posts/${postId}/edit`}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100"
                  >
                    수정하기
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100"
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="post-container mb-20">
          {/* 작성자 정보 */}
          <div className="flex items-center p-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full mr-3">
              <div className="w-full h-full rounded-full flex items-center justify-center text-gray-500">
                {post.authorNickname.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="font-semibold">
                <Link
                  href={`/users/${post.authorId}`}
                  className="hover:underline"
                >
                  {post.authorNickname}
                </Link>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(post.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* 이미지 캐러셀 */}
          {post.imageUrls.length > 0 && (
            <div className="relative">
              <div className="w-full aspect-square relative overflow-hidden">
                <Image
                  src={post.imageUrls[activeImageIndex]}
                  alt={`게시글 이미지 ${activeImageIndex + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>

              {post.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-white z-10"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-30 rounded-full flex items-center justify-center text-white z-10"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>

                  {/* 이미지 인디케이터 */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                    {post.imageUrls.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          idx === activeImageIndex
                            ? "bg-blue-500"
                            : "bg-white bg-opacity-50"
                        }`}
                      ></div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="p-4 flex gap-4">
            <button onClick={handleLike} className="text-2xl">
              {post.likedByCurrentUser ? "❤️" : "🤍"}
            </button>
            <button
              className="text-2xl"
              onClick={() => document.getElementById("comment-input")?.focus()}
            >
              💬
            </button>
          </div>

          {/* 좋아요 수 */}
          {post.likeCount > 0 && (
            <div className="px-4 font-semibold text-sm">
              좋아요 {post.likeCount}개
            </div>
          )}

          {/* 제목 및 내용 */}
          <div className="px-4 py-2">
            <div className="mb-1">
              <Link
                href={`/users/${post.authorId}`}
                className="font-semibold hover:underline"
              >
                {post.authorNickname}
              </Link>{" "}
              <span className="text-lg font-medium">{post.title}</span>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap text-sm">
              {post.content}
            </p>
          </div>

          {/* 댓글 섹션 */}
          <div className="px-4 pt-4 border-t border-gray-100 mt-4">
            <h3 className="text-sm text-gray-500 mb-4">
              {comments.length > 0
                ? `댓글 ${comments.length}개`
                : "첫 댓글을 남겨보세요"}
            </h3>

            {/* 댓글 목록 */}
            {renderComments(comments)}

            {/* 댓글 입력 */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-white py-3 px-4 flex items-center mt-6">
              <input
                id="comment-input"
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? "답글 입력..." : "댓글 입력..."}
                className="flex-grow border-none focus:ring-0 text-sm"
              />
              {replyTo && (
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-gray-400 text-sm mr-2"
                >
                  취소
                </button>
              )}
              <button
                onClick={handleCommentSubmit}
                disabled={!newComment.trim()}
                className={`font-semibold ${
                  newComment.trim()
                    ? "text-blue-500"
                    : "text-blue-200 cursor-default"
                }`}
              >
                게시
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
