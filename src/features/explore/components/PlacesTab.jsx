import { Modal } from '../../../components/Modal';
import { EXPLORE_GRID, EXPLORE_MAIN } from '../../../config/layout';
import { RouteSuggestionsModal } from '../../itinerary';
import { usePlacesTab } from '../hooks/usePlacesTab';
import { DataAttribution } from './DataAttribution';
import { FilterPanel } from './FilterPanel';
import { PlaceResultList } from './PlaceResultList';
import { RelaxedNotice } from './RelaxedNotice';
import { ResultToolbar } from './ResultToolbar';
import { TripDraftPanel } from './TripDraftPanel';

// Mục "Địa điểm": danh sách địa điểm 1 cột ở giữa (chính), khung chuyến đi bên phải; bộ lọc chỉ hiện khi bấm nút "Bộ lọc".
export const PlacesTab = () => {
  const { filterSheetRef, ...tab } = usePlacesTab();
  const { filters, options, places, draft, routes } = tab;
  const tripPanel = (
    <TripDraftPanel
      places={draft.places}
      preview={tab.preview}
      arrange={tab.arrange}
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
  );

  return (
    <div className={EXPLORE_GRID}>
      <div className={EXPLORE_MAIN}>
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
        {/* Màn chưa đủ rộng cho cột phải: khung chuyến đi nằm trên danh sách */}
        <div className="xl:hidden mb-3">{tripPanel}</div>
        <PlaceResultList
          places={places.items}
          isLoading={places.isLoading}
          error={places.error}
          page={places.page}
          totalPages={places.totalPages}
          hasMore={places.hasMore}
          isOpenEnded={places.totalCapped}
          onPageChange={places.goToPage}
          onRetry={places.reload}
          onReset={tab.resetFilters}
          draftIds={tab.draftIds}
          tagLabels={tab.tagLabels}
          onToggleDraft={tab.toggleDraft}
          onShare={tab.sharePlace}
          onOpenReviews={tab.reviews.openReviews}
        />
        <DataAttribution items={options.attribution} />
      </div>

      {/* Cột phải luôn thấy khi cuộn danh sách; dài hơn màn hình thì tự cuộn riêng */}
      <aside className="hidden xl:block xl:sticky xl:top-6 xl:max-h-[calc(100dvh-7.5rem)] xl:overflow-y-auto scrollbar-none">{tripPanel}</aside>

      <Modal isOpen={tab.filterSheet.isOpen} title="Bộ lọc" onClose={tab.filterSheet.close} containerRef={filterSheetRef} size="lg">
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
        <div className="sticky -bottom-6 sm:-bottom-7 -mx-6 sm:-mx-7 mt-6 px-6 sm:px-7 py-3 bg-surface border-t border-neutral-100">
          <button type="button" onClick={tab.filterSheet.close} className="w-full py-3 rounded-button bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold">
            Xem {places.totalLabel} địa điểm
          </button>
        </div>
      </Modal>
      <RouteSuggestionsModal routes={routes} onSelect={tab.selectSuggestion} onShowOnMap={tab.showOnMap} />
    </div>
  );
};
