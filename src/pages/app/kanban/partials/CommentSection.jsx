import React, { useState, useEffect, useCallback, useRef } from "react";
import { Spinner } from "reactstrap";
import { Icon, UserAvatar, Button } from "@/components/Component";
import { useAuth } from "@/context/AuthContext";
import { commentsApi } from "@/api/comments.api";
import { findUpper } from "@/utils/Utils";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

/* ── Quick suggestion chips ── */
const SUGGESTIONS = [
  "Suggest a reply...",
  "Who is working on this...?",
  "Status update...",
  "Ready for review",
];

/* ── Relative time helper ── */
const relativeTime = (iso) => {
  if (!iso) return "just now";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff} seconds ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m} minute${m > 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* ── User helpers ── */
const getName = (c) =>
  c?.user?.name || c?.user?.fullName || c?.userName || "Team Member";

const getInitial = (name) => findUpper(name || "U");

const canDelete = (currentUser, c) => {
  if (!currentUser || !c) return false;
  if (["ADMIN", "admin"].includes(currentUser.role)) return true;
  const uid = c.userId || c.user_id || c.user?.id;
  return String(currentUser.id) === String(uid);
};

/* ════════════════════════════════════════════════
   CommentSection
   Props: taskId, className
   ════════════════════════════════════════════════ */
const CommentSection = ({ taskId, className = "" }) => {
  const { user: currentUser } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  /* ── fetch ── */
  const fetchComments = useCallback(async () => {
    if (!taskId) { setComments([]); return; }
    setLoading(true);
    try {
      const res = await commentsApi.getTaskComments(taskId);
      setComments(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("fetch comments:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  /* ── focus textarea when expanded ── */
  useEffect(() => {
    if (expanded && textareaRef.current) textareaRef.current.focus();
  }, [expanded]);

  /* ── handlers ── */
  const handleExpand = () => setExpanded(true);

  const handleCancel = () => {
    setText("");
    setExpanded(false);
  };

  const handleSuggestion = (s) => {
    setText(s === "Suggest a reply..." ? "" : s);
    setExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handlePost = async () => {
    const trimmed = text.trim();
    if (!taskId || !trimmed || submitting) return;
    setSubmitting(true);
    try {
      const res = await commentsApi.addComment(taskId, { comment: trimmed });
      if (res?.data) {
        setComments((prev) => [res.data, ...prev]);
        setText("");
        setExpanded(false);
        toast.success("Comment posted");
      }
    } catch (err) {
      console.error("post comment:", err);
      toast.error(err?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const [deleteCommentModal, setDeleteCommentModal] = useState({ isOpen: false, commentId: null, loading: false });

  const confirmDeleteComment = async () => {
    if (!deleteCommentModal.commentId) return;
    setDeleteCommentModal((prev) => ({ ...prev, loading: true }));
    try {
      await commentsApi.deleteComment(deleteCommentModal.commentId);
      setComments((prev) => prev.filter((c) => (c.id || c._id) !== deleteCommentModal.commentId));
      toast.success("Comment deleted successfully");
      setDeleteCommentModal({ isOpen: false, commentId: null, loading: false });
    } catch (err) {
      console.error("delete comment:", err);
      toast.error(err?.message || "Failed to delete comment");
      setDeleteCommentModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") { handleCancel(); return; }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { handlePost(); }
  };

  /* ── render ── */
  return (
    <div className={`w-full min-w-0 block space-y-6 ${className}`}>

      {/* ══════════ Section heading ══════════ */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0">
          Comments
        </div>
        {!loading && comments.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
            {comments.length}
          </span>
        )}
      </div>

      {/* ══════════ Composer ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '32px minmax(0, 1fr)', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
        {/* Avatar */}
        <div style={{ paddingTop: '4px' }}>
          <UserAvatar
            text={getInitial(currentUser?.name)}
            theme="primary"
            className="sm"
          />
        </div>

        {/* Composer card */}
        <div style={{ display: 'block', minWidth: 0 }}>
          {/* Collapsed: single-line click target */}
          {!expanded && (
            <Button
              type="button"
              onClick={handleExpand}
              className="
                w-full text-left px-4 py-3 rounded-xl
                border border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-900
                text-[13px] text-slate-400 dark:text-slate-500
                hover:border-indigo-300 dark:hover:border-indigo-600
                hover:bg-slate-50 dark:hover:bg-slate-800/60
                transition-all shadow-sm
              "
            >
              Add a comment...
            </Button>
          )}

          {/* Expanded */}
          {expanded && (
            <div className="
              flex flex-col
              rounded-xl border border-indigo-500
              ring-2 ring-indigo-500/20
              bg-white dark:bg-slate-900
              shadow-sm
            ">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment..."
                rows={3}
                className="
                  block w-full bg-transparent resize-y min-h-22.5
                  px-4 pt-3 pb-2
                  text-sm text-slate-800 dark:text-slate-100
                  placeholder-slate-400 dark:placeholder-slate-500
                  focus:outline-none focus:ring-0 border-0
                  leading-relaxed
                "
              />

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-1.5 px-4 pb-3 shrink-0">
                {SUGGESTIONS.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestion(s)}
                    className="
                      px-2.5 py-1 rounded-md text-[11px] font-medium
                      border border-slate-200 dark:border-slate-700
                      text-slate-600 dark:text-slate-300
                      bg-white dark:bg-slate-800
                      hover:bg-slate-100 dark:hover:bg-slate-700
                      hover:border-indigo-400 dark:hover:border-indigo-600
                      transition-colors
                    "
                  >
                    {s}
                  </Button>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 mb-3 shrink-0">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 select-none">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    Ctrl+Enter
                  </kbd>{" "}
                  to save &nbsp;·&nbsp;{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    Esc
                  </kbd>{" "}
                  to cancel
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    onClick={handleCancel}
                    className="
                      px-3 py-1.5 rounded-lg text-xs font-semibold
                      text-slate-600 dark:text-slate-300
                      bg-slate-100 dark:bg-slate-800
                      hover:bg-slate-200 dark:hover:bg-slate-700
                      transition-colors
                    "
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    color="primary"
                    disabled={submitting || !text.trim()}
                    onClick={handlePost}
                    className="
                      inline-flex items-center gap-1.5
                      px-4 py-1.5 rounded-lg text-xs font-semibold
                      transition-colors
                    "
                  >
                    {submitting ? <Spinner size="sm" /> : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ Comment Feed ══════════ */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400 dark:text-slate-500">
          <Spinner size="sm" /> Loading comments...
        </div>
      )}

      {!loading && comments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Icon name="msg" className="text-slate-400 dark:text-slate-500" />
          </div>
          <p className="m-0 text-xs text-center text-slate-400 dark:text-slate-500">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}

      {!loading && comments.length > 0 && (
        <div style={{ display: 'block', marginTop: '16px' }}>
          {comments.map((c) => {
            const cId = c.id || c._id;
            const name = getName(c);

            return (
              <div key={cId} style={{ display: 'grid', gridTemplateColumns: '32px minmax(0, 1fr)', gap: '12px', marginBottom: '28px', position: 'relative' }}>
                {/* Avatar */}
                <div style={{ paddingTop: '2px' }}>
                  <UserAvatar
                    text={getInitial(name)}
                    theme="secondary"
                    className="sm"
                  />
                </div>

                {/* Body */}
                <div style={{ display: 'block', minWidth: 0 }}>
                  {/* Name + time */}
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {name}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {relativeTime(c.createdAt || c.created_at)}
                    </span>
                  </div>

                  {/* Comment text */}
                  <p className="m-0 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                    {c.comment}
                  </p>

                  {/* Action row */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 pb-1">
                    {/* Like */}
                    <div className="block shrink-0">
                      <Button type="button" title="Like" color="light" style={{ padding: '2px 6px', height: '24px', lineHeight: '20px', margin: 0 }}
                        className="inline-flex items-center justify-center gap-1 rounded-md text-[11px] font-medium text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none border-0">
                        <Icon name="thumbs-up" className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Reply */}
                    <div className="block shrink-0">
                      <Button type="button" title="Reply" color="light" style={{ padding: '2px 6px', height: '24px', lineHeight: '20px', margin: 0 }}
                        onClick={() => { setText(`@${name} `); setExpanded(true); }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md text-[11px] font-medium text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none border-0">
                        <Icon name="reply" className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </Button>
                    </div>

                    {/* Delete — only for owner/admin */}
                    {canDelete(currentUser, c) && (
                      <div className="block shrink-0">
                        <Button type="button" title="Delete" color="light" style={{ padding: '2px 6px', height: '24px', lineHeight: '20px', margin: 0 }}
                          onClick={() => setDeleteCommentModal({ isOpen: true, commentId: cId, loading: false })}
                          className="inline-flex items-center justify-center gap-1 rounded-md text-[11px] text-slate-400 dark:text-slate-500 hover:text-rose-500 bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-none border-0">
                          <Icon name="trash" className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteCommentModal.isOpen}
        toggle={(open) => setDeleteCommentModal((prev) => ({ ...prev, isOpen: open }))}
        onConfirm={confirmDeleteComment}
        title="Delete Comment"
        confirmButtonText="Delete"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        loading={deleteCommentModal.loading}
      />
    </div>
  );
};

export default CommentSection;
