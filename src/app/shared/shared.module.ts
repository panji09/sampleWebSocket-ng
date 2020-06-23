import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED_ZORRO_MODULES } from 'src/app/shared/ng-zorro';

@NgModule({
  declarations: [],
  imports: [CommonModule, ...SHARED_ZORRO_MODULES],
  exports: [CommonModule, ...SHARED_ZORRO_MODULES],
})
export class SharedModule {}
