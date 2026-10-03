import { Link } from 'react-router';
import { Globe, Users, CheckCircle2 } from 'lucide-react';
import { Avatar } from '../../../components/Avatar';
import { formatRelativeTime } from '../../../utils/formatRelativeTime';
import { ItineraryActionButton, ItineraryCard } from '../../itinerary';
import { PlaceEmbed } from './PlaceEmbed';
import { StarRating } from './StarRating';

// Nội dung 1 bài viết gốc: tác giả, lời viết, địa điểm / lộ trình đính kèm, hashtag, người được gắn thẻ.
export const PostContent = ({ post, onTagClick, onCloneItinerary, cloningId }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2.5">
      <Link to={post.is_mine ? '/profile' : `/users/${post.author.id}`} className="shrink-0">
        <Avatar name={post.author.username} src={post.author.avatar_url} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-tight flex items-center flex-wrap gap-1">
          <Link to={post.is_mine ? '/profile' : `/users/${post.author.id}`} className="font-bold text-neutral-900 hover:underline">{post.author.username}</Link>
          <span className="text-[11px] font-medium text-accent-600">Lv.{post.author.level}</span>
          {post.visited && (
            <span className="text-xs text-success-700 inline-flex items-center gap-1 font-medium">
              · đã đến đây <CheckCircle2 className="w-3.5 h-3.5 text-success-600 inline shrink-0" />
            </span>
          )}
        </p>
        <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
          <span>{formatRelativeTime(post.created_at)}</span>
          <span>·</span>
          <span title={post.visibility === 'public' ? 'Công khai' : 'Bạn bè'} className="inline-flex items-center">
            {post.visibility === 'public' ? <Globe className="w-3.5 h-3.5 text-neutral-400" /> : <Users className="w-3.5 h-3.5 text-neutral-400" />}
          </span>
        </p>
      </div>
      {post.rating && <StarRating value={post.rating} size="w-3.5 h-3.5" />}
    </div>

    {post.content && <p className="text-sm text-neutral-800 whitespace-pre-line break-words">{post.content}</p>}

    {post.type === 'place' && (post.place ? <PlaceEmbed place={post.place} /> : <p className="text-xs italic text-neutral-400">Địa điểm này không còn tồn tại.</p>)}
    {post.type === 'itinerary' && (post.itinerary ? (
      <ItineraryCard
        itinerary={post.itinerary}
        showVisibility={false}
        actions={!post.itinerary.is_mine && (
          <ItineraryActionButton icon="bookmark" tone="primary" disabled={cloningId === post.itinerary.id} onClick={() => onCloneItinerary(post.itinerary.id)}>
            {cloningId === post.itinerary.id ? 'Đang lưu…' : 'Dùng lộ trình này'}
          </ItineraryActionButton>
        )}
      />
    ) : <p className="text-xs italic text-neutral-400">Lộ trình này đã bị xoá.</p>)}

    {(post.tags.length > 0 || post.tagged_users.length > 0) && (
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {post.tags.map((tag) => (
          <button key={tag} type="button" onClick={() => onTagClick(tag)} className="font-medium text-info-700 hover:underline">#{tag}</button>
        ))}
        {post.tagged_users.length > 0 && (
          <span className="text-xs text-neutral-500">
            — cùng với {post.tagged_users.map((user, index) => (
              <span key={user.id}>{index > 0 && ', '}<Link to={`/users/${user.id}`} className="font-semibold text-neutral-700 hover:underline">{user.username}</Link></span>
            ))}
          </span>
        )}
      </p>
    )}
  </div>
);
