import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface STACItemPreview {
  id: string;
  thumbnailUrl: string;
  downloadUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class StacService {
  constructor(private http: HttpClient) {}

  public getStacItems(extent: number[]): Observable<STACItemPreview[]> {
    return this.http.post<STACItemPreview[]>(
      'http://localhost:8080/tiny-stac/api/v1/items',
      {
        extent: extent,
      }
    );
  }

  public getImage(id: string, extent: number[]): Observable<Blob> {
    return this.http.post(
      'http://localhost:8080/tiny-stac/api/v1/geotiff',
      {
        extent: extent,
        id: id,
      },
      {
        responseType: 'blob',
      }
    );
  }
}
