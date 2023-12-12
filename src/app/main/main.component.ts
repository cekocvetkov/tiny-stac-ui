import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { MainState, MainStore } from './main.component.store';
import { provideComponentStore } from '@ngrx/component-store';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  providers: [provideComponentStore(MainStore)],
})
export class MainComponent implements OnInit {
  vm$ = this.mainStore.vm$;
  constructor(private mainStore: MainStore) {}
  ngOnInit(): void {}

  onLoadImage(itemId: string) {
    this.mainStore.loadImage(itemId);
  }
  onDrawEnd(extent: number[]) {
    this.mainStore.getItems(extent);
  }
}
