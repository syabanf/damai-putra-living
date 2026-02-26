import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Share2, Newspaper, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_NEWS = {
  1: { id: 1, title: 'ASG News February 2026', date: '13 Feb 2026', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80', content: 'Latest updates from ASG February 2026 covering community developments and new initiatives. This month we have exciting announcements regarding new facilities, community programs, and improvements to township services. Our dedicated team continues to work towards making Damai Putra Township a premier destination for residents and visitors.' },
  2: { id: 2, title: 'Township Development Update Q1', date: '01 Feb 2026', img: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80', content: 'Comprehensive update on township development progress in Q1 2026 with new infrastructure announcements. The first quarter has seen significant progress on multiple fronts including commercial development, residential expansion, and enhanced amenities. We are proud to report completion of several key projects and initiation of new ones.' },
  3: { id: 3, title: 'New Amenities Opening Soon', date: '20 Jan 2026', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80', content: 'Exciting new amenities launching soon in the township including fitness centers and retail spaces. We are thrilled to announce the upcoming opening of state-of-the-art facilities designed to enhance the lifestyle of our residents. These new additions reflect our commitment to providing world-class amenities and services.' },
  4: { id: 4, title: 'Community Events Schedule 2026', date: '15 Jan 2026', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', content: 'Full schedule of community events planned for 2026 with details on participation and registration. Throughout the year, we have curated a diverse range of events designed to bring the community together and celebrate our shared values. From cultural festivals to wellness programs, there is something for everyone.' },
};

const MOCK_COMMENTS = {
  1: [
    { id: 1, name: 'Ahmad Wijaya', time: '2 hours ago', text: 'Great news! Looking forward to the new facilities.' },
    { id: 2, name: 'Siti Nurhaliza', time: '5 hours ago', text: 'This is wonderful development for our community.' },
  ],
  2: [
    { id: 1, name: 'Budi Santoso', time: '1 day ago', text: 'Impressive progress! Keep up the good work.' },
  ],
  3: [],
  4: [
    { id: 1, name: 'Maria Santos', time: '3 days ago', text: 'Excited about the new events planned!' },
  ],
};

export default function NewsDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const news = MOCK_NEWS[id] || MOCK_NEWS[1];
  const [comments, setComments] = useState(MOCK_COMMENTS[id] || []);
  const [commentText, setCommentText] = useState('');

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: news.title, text: news.content, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: comments.length + 1,
        name: 'You',
        time: 'just now',
        text: commentText,
      };
      setComments([newComment, ...comments]);
      setCommentText('');
    }
  };

  return (
    <div className="min-h-screen pb-10" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.9)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(createPageUrl('News'))} className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <h1 className="font-bold text-xl text-slate-800">News</h1>
        </div>
        <button onClick={handleShare} className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
          <Share2 className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-5 space-y-4">
        {/* Hero Image */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden h-64">
          <img src={news.img} alt={news.title} className="w-full h-full object-cover" />
        </motion.div>

        {/* Title & Meta */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Newspaper className="w-4 h-4 text-stone-400" />
            <span className="text-xs text-stone-400 font-semibold uppercase tracking-wide">News</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 leading-tight">{news.title}</h2>
          <p className="text-sm text-slate-400">{news.date}</p>
        </motion.div>

        {/* Body */}
         <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
           className="rounded-2xl p-4"
           style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)' }}>
           <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{news.content}</p>
         </motion.div>

         {/* Comments Section */}
         <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
           <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.85)' }}>
             <h3 className="font-bold text-slate-800 mb-4">Comments ({comments.length})</h3>

             {/* Comment Input */}
             <div className="flex gap-2 mb-4 pb-4 border-b border-slate-200">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex-shrink-0" />
               <div className="flex-1 flex gap-2">
                 <input
                   type="text"
                   placeholder="Add a comment..."
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                   className="flex-1 bg-transparent text-sm outline-none placeholder-slate-400 text-slate-700"
                 />
                 <button onClick={handleAddComment} disabled={!commentText.trim()}
                   className="text-cyan-500 hover:text-cyan-600 disabled:text-slate-300 transition-colors">
                   <Send className="w-4 h-4" />
                 </button>
               </div>
             </div>

             {/* Comments List */}
             <div className="space-y-3">
               {comments.length > 0 ? (
                 comments.map((comment) => (
                   <motion.div key={comment.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                     className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex-shrink-0" />
                     <div className="flex-1">
                       <div className="flex items-center gap-2">
                         <span className="font-semibold text-sm text-slate-800">{comment.name}</span>
                         <span className="text-xs text-slate-400">{comment.time}</span>
                       </div>
                       <p className="text-sm text-slate-600 mt-1">{comment.text}</p>
                     </div>
                   </motion.div>
                 ))
               ) : (
                 <p className="text-center text-slate-400 text-sm py-4">No comments yet. Be the first to comment!</p>
               )}
             </div>
           </div>
         </motion.div>
        </div>
        </div>
        );
        }