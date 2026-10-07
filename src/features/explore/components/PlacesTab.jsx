import { Modal } from '../../../components/Modal';
import { RouteSuggestionsModal } from '../../itinerary';
import { usePlacesTab } from '../hooks/usePlacesTab';
import { DataAttribution } from './DataAttribution';
import { FilterPanel } from './FilterPanel';
import { PlaceResultList } from './PlaceResultList';
import { RelaxedNotice } from './RelaxedNotice';
import { ResultToolbar } from './ResultToolbar';
import { TripDraftPanel } from './TripDraftPanel';

// Tab "Địa điểm": cột bộ lọc · kết quả · giỏ chuyến đi (desktop 3 cột, mobile xếp dọc + bộ lọc dạng hộp thoại).
export const PlacesTab = () => {
  const { filterSheetRef, ...tab } = usePlacesTab();
  const { filters, options, places, draft, routes } = tab;
  const filterPanel = (
    <FilterPanel
      filters={filters}
      options={options}
      onChange={tab.setFilter}
      onReset={tab.resetFilters}
      origin={tab.origin.origin}
      isLocating={tab.origin.isLocating}
      onLocate={tab.origin.locateMe}
      activeCount={tab.activeFilterCount}
    />
  );

  return (
    <div className="grid lg:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_300px] gap-5 items-start">
      {/* Cột bộ lọc cao hơn màn hình => tự cuộn riêng để luôn với tới được mọi mục */}
      <aside className="hidden lg:block bg-surface rounded-card shadow-card p-5 lg:sticky lg:top-0 lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto">{filterPanel}</aside>

      <div className="min-w-0">
        <ResultToolbar
          total={places.totalLabel}
          isLoading={places.isLoading}
          keyword={places.keyword}
          searchRadiusKm={places.radiusKm}
          sort={filters.sort}
          sortOptions={options.sorts}
          onSortChange={(sort) => tab.setFilter('sort', sort)}
          activeCount={tab.activeFilterCount}
          onOpenFilters={tab.filterSheet.open}
        />
        {places.relaxed && !places.isLoading && <RelaxedNotice relaxed={places.relaxed} onApply={tab.applyRelaxed} />}
        <div className="xl:hidden mb-3">
          <TripDraftPanel
            places={draft.places}
            preview={tab.preview}
            tripName={draft.tripName}
            onNameChange={draft.setTripName}
            onSave={tab.saveDraft}
            isSaving={tab.isSaving}
            isEditing={tab.isEditing}
            onCancelEdit={tab.cancelEditing}
            onRemove={draft.removePlace}
            onClear={draft.clearPlaces}
            onSuggest={tab.suggestRoutes}
            isSuggesting={routes.isSuggesting}
          />
        </div>
        <PlaceResultList
          places={places.items}
          isLoading={places.isLoading}
          error={places.error}
          hasMore={places.hasMore}
          onLoadMore={places.loadMore}
          onRetry={places.reload}
          onReset={tab.resetFilters}
          draftIds={tab.draftIds}
          tagLabels={tab.tagLabels}
          onToggleDraft={tab.toggleDraft}
          onShare={tab.sharePlace}
        />
        <DataAttribution items={options.attribution} />
      </div>

      <aside className="hidden xl:block xl:sticky xl:top-0">
        <TripDraftPanel
          places={draft.places}
          preview={tab.preview}
          tripName={draft.tripName}
          onNameChange={draft.setTripName}
          onSave={tab.saveDraft}
          isSaving={tab.isSaving}
          isEditing={tab.isEditing}
          onCancelEdit={tab.cancelEditing}
          onRemove={draft.removePlace}
          onClear={draft.clearPlaces}
          onSuggest={tab.suggestRoutes}
          isSuggesting={routes.isSuggesting}
        />
      </aside>

      <Modal isOpen={tab.filterSheet.isOpen} title="Bộ lọc" onClose={tab.filterSheet.close} containerRef={filterSheetRef}>
        {filterPanel}
        <button type="button" onClick={tab.filterSheet.close} className="mt-6 w-full py-3 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold">
          Xem {places.totalLabel} địa điểm
        </button>
      </Modal>
      <RouteSuggestionsModal routes={routes} onSelect={tab.selectSuggestion} onShowOnMap={tab.showOnMap} />
    </div>
  );
};
