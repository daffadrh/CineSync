import { useNavigate } from 'react-router-dom';
import { MOCK_CLIPS } from '../js/services/clips-data.js';

const SECTIONS = [
    {
        prefix: 'Want to watch something',
        highlight: 'NEW',
        suffix: '?',
        clips: MOCK_CLIPS.slice(0, 5),
    },
    {
        prefix: 'Clips trending in your',
        highlight: 'AREA',
        suffix: '',
        clips: MOCK_CLIPS.slice(5, 10),
    },
    {
        prefix: 'Feeling',
        highlight: 'NOSTALGIC',
        suffix: '? Here are some clips you\'ve watched',
        clips: MOCK_CLIPS.slice(10, 15),
    },
];

export default function Clips() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="max-w-screen-xl mx-auto">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                    Discover moments in short form
                </p>
                <h2 className="font-serif text-4xl font-bold mb-10">
                    Find what <span className="text-yellow-500 italic">other people</span> are watching.
                </h2>

                {SECTIONS.map((section, i) => (
                    <section key={i} className="mb-12">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-5">
                            {section.prefix} <span className="text-yellow-500">{section.highlight}</span>{section.suffix}
                        </h3>
                        <div className="clips-grid">
                            {section.clips.map(clip => (
                                <ClipCard
                                    key={clip.id}
                                    clip={clip}
                                    onClick={() => navigate(`/clips/${clip.id}`)}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
            </div>
        </div>
    );
}

function ClipCard({ clip, onClick }) {
    return (
        <div
            className={`relative rounded-2xl overflow-hidden cursor-pointer aspect-[9/16] ${clip.gradientClass}`}
            onClick={onClick}
        >
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                <div className="flex flex-wrap gap-1 mb-1.5">
                    {clip.tags.map(tag => (
                        <span key={tag} className="text-xs text-yellow-400">{tag}</span>
                    ))}
                </div>
                <p className="text-white text-sm leading-snug line-clamp-2">{clip.caption}</p>
                <div className="flex items-center gap-1.5 mt-2 text-gray-400 text-xs">
                    <i className="fa-regular fa-comment text-[10px]" />
                    <span>{clip.commentCount}</span>
                </div>
            </div>
        </div>
    );
}
