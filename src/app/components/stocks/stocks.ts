import { Component, signal, computed, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { StocksService } from '../../services/stocks.service';
import { AddStockModal } from '../reusableComponents/add-stock-modal/add-stock-modal';
import { SocketService } from '../../services/socket.service';


@Component({
  selector: 'app-stocks',
  imports: [CommonModule, AddStockModal],
  templateUrl: './stocks.html',
  styleUrl: './stocks.css',
})
export class Stocks implements OnInit {
  private userService = inject(UserService);
  private stocksService = inject(StocksService);
  private router = inject(Router);
  private socketService = inject(SocketService)

  @ViewChild('addStockModal')
  addStockModal!: AddStockModal;

  open() {
    this.addStockModal.open();
  }

  // User Email signal retrieved from auth storage
  userEmail = signal<string | null>(null);

  // Stock Data from API
  stocks = signal<any[]>([]);
  isLoadingData = signal<boolean>(false);

  // Pagination states
  currentPage = signal<number>(1);
  pageSize = signal<number>(30);
  totalItems = signal<number>(0);
  totalPages = signal<number>(1);

  pages = computed<(number | string)[]>(() => {
    const current = this.currentPage();
    const total = this.totalPages();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  });

  constructor() {
    // Read current user email from localStorage auth object
    const userData = this.userService.getUserData();
    if (userData && userData.email) {
      this.userEmail.set(userData.email);
    }

    // Initial load of stocks
    this.loadStocks();
  }

  ngOnInit(): void {

    this.socketService.onStockAdded()
      .subscribe(() => {

        console.log('New stock added, refreshing list');

        this.loadStocks();
      });
  }

  loadStocks() {
    this.isLoadingData.set(true);
    this.stocksService.getStocks(this.currentPage(), this.pageSize())
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this.stocks.set(response.data.stocks);
            this.totalItems.set(response.data.total);
            this.totalPages.set(response.data.totalPages);
          }
          this.isLoadingData.set(false);
        },
        error: (error) => {
          console.error('Failed to load stocks', error);
          this.isLoadingData.set(false);
        }
      });
  }

  goToPage(page: number | string) {
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= this.totalPages()) {
      this.currentPage.set(pageNum);
      this.loadStocks();
    }
  }

  onPageSizeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newSize = parseInt(select.value, 10);
    this.pageSize.set(newSize);
    this.currentPage.set(1);
    this.loadStocks();
  }

  logout() {
    this.userService.logoutApi().subscribe({
      next: () => {
        localStorage.removeItem('auth');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed', error);
      }
    });
  }
}
