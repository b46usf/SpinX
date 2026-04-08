# Modal System Refactor - TODO

Current Working Directory: FE/js/components/utils/

## Approved Plan Steps (Separation of Concerns - Modular DRY)

### Phase 1: Extract Assets (Complete Phase 1 before edits)
- [x] **Step 1**: Create `FE/css/modals.css` - Extract all inline styles from Modal.js
- [x] **Step 2**: Create `FE/js/components/utils/modalUtils.js` - Utils + constants (sanitizeHtml, formatDateID, STATUS_META, MODAL_DEFAULTS, getModalTheme)
- [x] **Step 3**: Create `FE/js/components/templates/ModalTemplates.js` - Pure template builders from Modal.js (buildSubscriptionTemplate, buildSchoolStatusTemplate, etc.)
- [x] **Step 4**: Create `FE/js/components/templates/ImportTemplate.js` - Extract generateImportHTML + handlers from ImportModal.js
- [x] **Step 5**: Create `FE/js/components/templates/RegisterTemplate.js` - Extract generateRegisterHTML + generateRenewalRegisterHTML from RegisterModal.js

### Phase 2: Core Refactor
- [ ] **Step 6**: Edit `FE/js/components/utils/Modal.js` 
  - Import new utils/templates/CSS
  - Implement `executeModal(config)` single entry + `handleHooks(result)`
  - Convert existing APIs to wrappers
  - Add centralized error boundary + didOpen listeners
- [ ] **Step 7**: Update `FE/js/components/modals/ImportModal.js` - Use executeModal + ImportTemplate
- [ ] **Step 8**: Update `FE/js/components/modals/RegisterModal.js` - Use executeModal + RegisterTemplate

### Phase 3: Verify & Test
- [ ] **Step 9**: Test all modals (subscription, schoolStatus, import, register)
  - Run browser, trigger modals from dashboards/landing
- [ ] **Step 10**: Update TODO.md with ✓, attempt_completion

**Notes**: 
- No business logic changes
- Pure functions for templates
- Single execution door: executeModal
- Centralized: handleHooks, error boundary
- Scoped listeners in didOpen

**Next**: Complete Step 1 → confirm → Step 2 → etc.

