import { NavLink } from 'react-router-dom';

function NavItem({ to, icon, label, end, expanded }) {
    return (
        <NavLink
            to={to}
            end={end}
            title={!expanded ? label : undefined}
            className={({ isActive }) =>
                `flex rounded-lg mx-1 transition-colors ${
                    isActive
                        ? 'text-white bg-white/10 font-medium'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
            }
        >
            {({ isActive }) => (
                <div className="flex items-center gap-3 pl-[22px] pr-3 py-3">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <i className={`${icon} ${isActive ? 'text-yellow-500' : ''}`} />
                    </div>
                    <span className={`text-sm whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-200 ${expanded ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'}`}>
                        {label}
                    </span>
                </div>
            )}
        </NavLink>
    );
}

export default function Sidebar({ expanded, onToggle }) {
    return (
        <aside className={`bg-[#141414] border-r border-[#2a2a2a] flex flex-col h-full flex-shrink-0 transition-all duration-300 overflow-hidden ${expanded ? 'w-64' : 'w-[72px]'}`}>

            {/* Header row — hamburger is centered using the same pixel logic as nav icons */}
            <div className="h-16 flex items-center flex-shrink-0 pl-[18px]">
                <button
                    onClick={onToggle}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
                >
                    <i className="fa-solid fa-bars" />
                </button>
                <span className={`text-2xl font-serif font-bold italic tracking-wide text-white whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-200 ${expanded ? 'max-w-[200px] opacity-100 pl-3' : 'max-w-0 opacity-0'}`}>
                    CineSync
                </span>
            </div>

            <div className="pb-6 flex-1 overflow-hidden">
                <nav className="space-y-1 mt-2">
                    <NavItem to="/"          icon="fa-solid fa-house"        label="Home"           end expanded={expanded} />
                    <NavItem to="/discover"  icon="fa-regular fa-compass"    label="Discover"           expanded={expanded} />
                    <NavItem to="/clips"     icon="fa-solid fa-chart-column" label="Trending Clips"     expanded={expanded} />
                    <NavItem to="/watchlist"       icon="fa-solid fa-list-ul"      label="Watchlist"        expanded={expanded} />
                    <NavItem to="/recommendations" icon="fa-solid fa-paper-plane"  label="Recommendations"  expanded={expanded} />
                </nav>
            </div>
        </aside>
    );
}
