# Changelog

All notable changes to Alliance MVP Selector will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2026-02-22

### Changed
- MVP history now displays ALL entries instead of just the last 10
  - Auto-cleanup still maintains reasonable history size
  - Entries displayed in reverse chronological order (newest first)

## [1.1.1] - 2026-01-14

### Added
- Cross-Server (CS) checkbox for MVP selection
  - Checkbox appears below event selection
  - When checked, appends " CS" to event name in MVP history
  - Allows differentiation between internal and cross-server events
- Device compatibility information in README

### Changed
- Event names in MVP history now support " CS" suffix for cross-server events

## [1.1.0] - 2026-01-13

### Added
- **MVP Selection Confirmation Prompts**: Both random and manual MVP selections now display a confirmation dialog showing:
  - Member name
  - Current MVP count
  - Current weight value
  - Eligibility verification prompt
- **Title Source Tracking**: Title assignments now prompt whether the title was earned individually or given by alliance
  - Individual titles saved as-is (e.g., "Duke/Duchess")
  - Alliance-given titles saved with " (ally)" suffix (e.g., "Duke/Duchess (ally)")
  - Source tracked in database with new `source` field
- **Automatic MVP History Cleanup**: MVP history now auto-maintains based on eligible player count
  - Keeps minimum of 10 entries
  - Maximum entries = number of eligible players
  - Automatically trims oldest entries after each MVP selection
- **Updated Title Options**: Changed to gender-inclusive format:
  - Earl/Countess (was: Earl)
  - Duke/Duchess (was: Duke)
  - King/Queen (was: Marquis removed)

### Removed
- **History Entry Deletion from UI**: All delete buttons removed from history display
  - `clearMVPHistory()` function removed
  - `clearTitleHistory()` function removed
  - `removeMVPEntry()` function removed
  - `removeTitleEntry()` function removed
  - History management now only available through Firestore backend
- **Clear History Buttons**: Replaced with informational message

### Changed
- History section now displays: "ℹ️ History auto-managed. Edit via Firestore if needed."
- Default selected title changed from "Earl" to "Earl/Countess"
- History display cards simplified (removed delete button containers)

### Security
- **Improved Data Integrity**: History can only be modified through Firebase Console, preventing accidental deletions
- **Enhanced Audit Trail**: All history changes must go through Firestore, maintaining complete audit log

### Fixed
- History entries now properly protected from accidental deletion
- Title assignment flow improved with clear source tracking
- MVP selection process includes verification step to prevent errors

### Technical
- Added `cleanupMVPHistory()` function for automatic history maintenance
- Modified `selectMVP()` to include confirmation prompts and call cleanup
- Modified `assignTitle()` to include individual/alliance prompt
- Updated state object with `titleSource` field (line 45)
- Updated title dropdown rendering (line 897-907)
- Updated history display rendering (line 1020-1077)

## [1.0.0] - 2026-01-11

### Added
- Initial release of Alliance MVP Selector
- Firebase Authentication integration
- Firestore database backend
- Role-based access control (Moderators and Viewers)
- Weighted random MVP selection algorithm
  - Recent MVPs have reduced probability of being selected again
  - Configurable weight and penalty parameters
- Manual MVP selection option
- Title assignment system (Earl, Marquis, Duke)
- Member management
  - Add new members
  - Remove members
  - Rename members across all data
  - Toggle member eligibility for MVP selection
- Event management
  - Predefined event types
  - Custom event creation
  - Event deletion
- MVP history tracking
  - View recent 10 selections
  - Remove individual entries
  - Clear all history
  - Track selection method (random vs manual)
- Title history tracking
  - View recent 10 assignments
  - Remove individual entries
  - Clear all history
- Admin panel for moderators
  - Centralized member management
  - Database information display
  - Quick access to member operations
- Responsive UI design
  - Works on desktop, tablet, and mobile
  - Modern gradient design with Tailwind CSS
  - Custom SVG icons
- Real-time data synchronization via Firebase
- Comprehensive error handling
  - Detailed error messages
  - Error recovery screen
  - Troubleshooting guidance
- Security features
  - Firebase Security Rules
  - Email-based moderator verification
  - Protected write operations
- Auto-initialization of database structure on first login
- Manual refresh button to sync latest data
- Select/Deselect all members functionality
- Member eligibility toggle
- Detailed console logging for debugging

### Security
- Implemented Firebase Security Rules
- Role-based access control
- Protected moderator operations
- Authenticated read access only
- Email verification for moderator status

### Documentation
- Comprehensive README with setup instructions
- Quick setup checklist
- Detailed troubleshooting guide
- Contributing guidelines
- MIT License
- Firebase Hosting configuration
- .gitignore for version control

### Technical Details
- Firebase SDK v10.7.1
- Tailwind CSS v3 (CDN)
- Vanilla JavaScript (ES6+)
- No build process required
- Client-side only (no backend server needed)
- Firebase Firestore for data persistence
- Firebase Authentication for user management

## [Unreleased]

### Planned Features
- Export data to CSV/Excel
- Import members from CSV
- Custom title creation and management
- Member statistics dashboard
- Event scheduling and calendar
- Push notifications for new MVP selections
- Multiple alliance support in single instance
- Dark/Light theme toggle
- Member profiles with avatars
- MVP leaderboards with rankings
- Advanced filtering and search
- Data visualization charts
- Bulk operations (bulk add/remove members)
- Audit log for all changes
- Backup and restore functionality
- Email notifications
- Mobile app version
- Internationalization (i18n)

### Known Issues
- No real-time updates (must refresh manually)
- Limited to 50,000 reads per day on Firebase free tier
- No data pagination (may slow with 1000+ members)
- No offline support
- No data validation on rename operation

### Potential Improvements
- Add loading indicators for long operations
- Implement optimistic UI updates
- Add confirmation dialogs for destructive actions
- Improve mobile responsiveness
- Add keyboard shortcuts
- Implement undo/redo functionality
- Add search and filter for members
- Improve error messages with actionable suggestions
- Add tooltips and help text
- Implement progressive web app (PWA) features

---

## Version History

- **1.0.0** (2026-01-11) - Initial release

---

## Migration Guides

### From PowerShell Script to Web App

If you were using the original PowerShell script version:

1. **Export your data** from the PowerShell script
2. **Set up Firebase** following the README
3. **Import data manually** or contact maintainers for migration script
4. Key differences:
   - Cloud-based instead of local
   - Multi-user instead of single-user
   - Real-time sync across devices
   - Role-based permissions

---

## Acknowledgments

- Original concept inspired by alliance gaming communities
- Built with Firebase, Tailwind CSS, and modern web standards
- Special thanks to all contributors and testers

---

For more details on each release, see the [GitHub Releases](https://github.com/YOUR-USERNAME/alliance-mvp-selector/releases) page.
