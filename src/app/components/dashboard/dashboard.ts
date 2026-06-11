import { Component, signal, inject, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { StocksService } from '../../services/stocks.service';
import { UserService } from '../../services/user.service';

interface ChartDataItem {
  label: string;
  value: number;
  rawDate: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnDestroy {
  private stocksService = inject(StocksService);
  private userService = inject(UserService);
  private router = inject(Router);

  // User session state
  userEmail = signal<string | null>(null);

  // UI state signals
  chartData = signal<ChartDataItem[]>([]);
  isLoadingData = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // ChartJS instance
  private chart: Chart | null = null;
  private chartCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Use a setter for ViewChild to handle conditionally rendered canvas from @if
  @ViewChild('chartCanvas') set chartCanvas(content: ElementRef<HTMLCanvasElement> | undefined) {
    if (content) {
      this.chartCanvasRef = content;
      // Delay slightly to ensure canvas layout dimensions are computed
      setTimeout(() => {
        this.createChart();
      }, 0);
    }
  }

  constructor() {
    // Read logged-in user
    const userData = this.userService.getUserData();
    if (userData && userData.email) {
      this.userEmail.set(userData.email);
    }

    // Load average monthly stocks
    this.loadChartData();
  }

  loadChartData() {
    this.isLoadingData.set(true);
    this.errorMessage.set(null);

    this.stocksService.getMonthlyAverageCloseStocks().subscribe({
      next: (response) => {
        if (response && response.success && Array.isArray(response.data)) {
          // Process and format monthly average data
          const formattedData: ChartDataItem[] = response.data.map((item: any) => {
            // Parse UTC dates timezone-independently
            const date = new Date(item.month);

            const monthLabel = date.toLocaleDateString('en-IN', {
              month: 'short',
              year: 'numeric',
              timeZone: 'Asia/Kolkata'
            });

            return {
              label: monthLabel,
              value: parseFloat(item.avg_close_price) || 0,
              rawDate: item.month
            };
          });

          this.chartData.set(formattedData);
        } else {
          this.errorMessage.set('Invalid response format received from server.');
        }
        this.isLoadingData.set(false);
      },
      error: (error) => {
        console.error('Failed to load monthly average stocks data:', error);
        this.errorMessage.set(error?.error?.message || 'Could not fetch monthly averages from server.');
        this.isLoadingData.set(false);
      }
    });
  }

  createChart() {
    // Destroy previous chart instance if it exists
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const canvas = this.chartCanvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = this.chartData().map(d => d.label);
    const values = this.chartData().map(d => d.value);

    // Dynamic gradient coloring matching the theme
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 350);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.85)'); // Emerald Green
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.85)');  // Indigo Blue

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Average Close Price ($)',
          data: values,
          backgroundColor: gradient,
          borderColor: '#10b981',
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: '#10b981',
          hoverBorderColor: '#6366f1',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(18, 22, 33, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#e5e7eb',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            displayColors: false,
            callbacks: {
              label: (context) => ` Average Price: $${Number(context.raw).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
              color: '#a0aec0',
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 11
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
              color: '#a0aec0',
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 11
              },
              callback: (value) => `$${value}`
            }
          }
        }
      }
    });
  }

  redirectToStocks() {
    this.router.navigate(['/stocks']);
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

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
