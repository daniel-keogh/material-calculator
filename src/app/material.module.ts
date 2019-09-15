import { NgModule } from '@angular/core';

import {
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatGridListModule,
  MatIconModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';

@NgModule({
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatGridListModule,
    MatIconModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  exports: [
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatGridListModule,
    MatIconModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule
  ]
})
export class MaterialModule {}
