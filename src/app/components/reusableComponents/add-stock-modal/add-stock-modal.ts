import { NgStyle } from '@angular/common';
import { Component, EventEmitter, inject, Output, signal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StocksService } from '../../../services/stocks.service';

@Component({
  selector: 'app-add-stock-modal',
  imports: [NgStyle, FormsModule],
  templateUrl: './add-stock-modal.html',
  styleUrl: './add-stock-modal.css',
})
export class AddStockModal {
  isOpen = signal<boolean>(false);
  private stocksService = inject(StocksService);

  @Output() loadStocks = new EventEmitter<void>();

  stockObj: any = {
    open: "",
    close: ""
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.stockObj = {
      open: "",
      close: ""
    }
  }

  onAddStock() {
    this.stocksService.addStock(this.stockObj.open, this.stockObj.close).subscribe({
      next: (res: any) => {
        this.loadStocks.emit();
        this.close();
        alert("Stock added successfully!")
      },
      error: (err) => {
        alert("Error : " + err.error || 'Something went wrong')
        this.close();
      }
    })
  }
}
