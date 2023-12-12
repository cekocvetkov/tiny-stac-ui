import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, switchMap, tap, withLatestFrom } from 'rxjs';
import { StacService } from '../services/stac.service';
import { MapService } from '../services/map.service';

export interface STACItemPreview {
  id: string;
  thumbnailUrl: string;
  downloadUrl: string;
}

export interface MainState {
  selectedItem: Blob | null;
  currentExtent: number[];
  items: STACItemPreview[];
  loading: boolean;
  error: string | null;
}

export const initialState: MainState = {
  selectedItem: null,
  currentExtent: [],
  items: [],
  loading: false,
  error: null,
};

@Injectable()
export class MainStore extends ComponentStore<MainState> {
  constructor(
    private stacService: StacService,
    private mapService: MapService
  ) {
    super(initialState);
  }

  private loading$ = this.select((state) => state.loading);
  private error$ = this.select((state) => state.error);
  private items$ = this.select((state) => state.items);
  private selectedItem$ = this.select((state) => state.selectedItem);
  private currentExtent$ = this.select((state) => state.currentExtent);

  public vm$ = this.select({
    loading: this.loading$,
    error: this.error$,
    items: this.items$,
    selectedItem: this.selectedItem$,
    currentExtent: this.currentExtent$,
  });

  private setLoading = this.updater((state) => ({
    ...state,
    loading: true,
  }));

  private setError = this.updater((state, errorMessage: string) => ({
    ...state,
    loading: false,
    error: errorMessage,
  }));

  private setItems = this.updater((state, items: STACItemPreview[]) => ({
    ...state,
    loading: false,
    items: items,
  }));
  private setCurrentExtent = this.updater((state, extent: number[]) => ({
    ...state,
    currentExtent: extent,
  }));
  private setSelectedItem = this.updater((state, item: Blob) => ({
    ...state,
    loading: false,
    selectedItem: item,
  }));

  readonly getItems = this.effect((extent$: Observable<number[]>) => {
    return extent$.pipe(
      tap((extent) =>
        console.log(`Get Items effect triggered for extent ${extent}`)
      ),
      tap(() => this.setLoading()),
      tap((extent) => this.setCurrentExtent(extent)),
      switchMap((extent: number[]) => {
        return this.stacService.getStacItems(extent).pipe(
          tap({
            next: (items: STACItemPreview[]) => {
              this.setItems(items);
            },
            error: (e) => this.setError(e),
          })
        );
      })
    );
  });

  readonly loadImage = this.effect((itemId$: Observable<string>) => {
    return itemId$.pipe(
      tap((itemId) => console.log(`Get image for item with id ${itemId}`)),
      tap(() => this.setLoading()),
      withLatestFrom(this.currentExtent$),
      tap(([_, currentExtent]) =>
        console.log(`... and extent ${currentExtent}`)
      ),
      switchMap(([itemId, currentExtent]: [string, number[]]) => {
        return this.stacService.getImage(itemId, currentExtent).pipe(
          tap({
            next: (image: Blob) => this.setSelectedItem(image),
            error: (e) => this.setError(e),
          })
        );
      })
    );
  });
}
