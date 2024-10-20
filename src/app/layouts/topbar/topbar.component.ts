import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Inject, Output, ViewChild, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UtilitiesService } from '../../services/utilities.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LanguageService } from 'src/app/core/services/language.service';
// Get Cart Data
import { cartList, notification } from './data';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { RootReducerState, getLayoutMode } from 'src/app/store/reducers';
import { Store } from '@ngrx/store';
import { changeMode } from 'src/app/store/actions/layout-action';
import { UserService } from '../../services/user.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})

// Topbar Component
export class TopbarComponent implements OnInit {

  userData$: Observable<any> = this.userService.userData$;

  country: any;
  selectedItem!: any;

  flagvalue: any;
  valueset: any;
  countryName: any;
  cookieValue: any;
  userData: any;
  cartData: any;

  element: any;
  mode: string | undefined;

  total: any;
  subtotal: any = 0;
  totalsum: any;
  taxRate: any = 0.125;
  shippingRate: any = '65.00';
  discountRate: any = 0.15;
  discount: any;
  tax: any;
  fullscreenicon: any = 'arrows-maximize';

  notificationList: any;
  totalNotify: number = 0;
  newNotify: number = 0;
  readNotify: number = 0;

  @Output() mobileMenuButtonClicked = new EventEmitter();
  @ViewChild('removeNotificationModal', { static: false }) removeNotificationModal?: ModalDirective;
  @ViewChild('removeCartModal', { static: false }) removeCartModal?: ModalDirective;
  deleteid: any;

  // Buscador
  searchResults: any[] = [];
  searchTerm$ = new Subject<string>();

  constructor(
    @Inject(DOCUMENT) private document: any,
    public languageService: LanguageService,
    private router: Router,
    private store: Store<RootReducerState>,
    public _cookiesService: CookieService,
    private userService: UserService,
    private apiService: ApiService,
    private utilitiesService: UtilitiesService
  ) { }

  ngOnInit(): void {

    this.userData$ = this.userService.getUserData();

    this.element = document.documentElement;
    this.cartData = cartList
    this.cartData.map((x: any) => {
      x['total'] = (x['qty'] * x['price']).toFixed(2)
      this.subtotal += parseFloat(x['total'])
    })
    this.subtotal = this.subtotal.toFixed(2)
    this.discount = (this.subtotal * this.discountRate).toFixed(2)
    this.tax = (this.subtotal * this.taxRate).toFixed(2);
    this.totalsum = (parseFloat(this.subtotal) + parseFloat(this.tax) + parseFloat(this.shippingRate) - parseFloat(this.discount)).toFixed(2)


    // Cookies wise Language set
    this.cookieValue = this._cookiesService.get('lang');
    const val = this.listLang.filter(x => x.lang === this.cookieValue);
    this.countryName = val.map(element => element.text);
    if (val.length === 0) {
      if (this.flagvalue === undefined) { this.valueset = 'assets/images/flags/us.svg'; }
      this.countryName = 'English'
    } else {
      this.flagvalue = val.map(element => element.flag);
    }

    this.notificationList = notification
    this.notificationList.forEach((element: any) => {
      this.totalNotify += element.items.length
      if (element.title == 'New') {
        this.newNotify = element.items.length
      } else {
        this.readNotify = element.items.length
      }
    });

  }

  /***
 * Language Listing
 */
  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.svg', lang: 'en' },
    { text: 'Española', flag: 'assets/images/flags/spain.svg', lang: 'sp' },
    { text: 'Deutsche', flag: 'assets/images/flags/germany.svg', lang: 'gr' },
    { text: 'Italiana', flag: 'assets/images/flags/italy.svg', lang: 'it' },
    { text: 'русский', flag: 'assets/images/flags/russia.svg', lang: 'ru' },
    { text: '中国人', flag: 'assets/images/flags/china.svg', lang: 'ch' },
    { text: 'français', flag: 'assets/images/flags/french.svg', lang: 'fr' },
    { text: 'Arabic', flag: 'assets/images/flags/ae.svg', lang: 'ar' },
  ];

  windowScroll() {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
      (document.getElementById('back-to-top') as HTMLElement).style.display = "block";
      document.getElementById('page-topbar')?.classList.add('topbar-shadow')
    } else {
      (document.getElementById('back-to-top') as HTMLElement).style.display = "none";
      document.getElementById('page-topbar')?.classList.remove('topbar-shadow')
    }
  }

  /**
   * Fullscreen method
   */
  fullscreen() {
    document.body.classList.toggle('fullscreen-enable');
    if (
      !document.fullscreenElement && !this.element.mozFullScreenElement &&
      !this.element.webkitFullscreenElement) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        /* Firefox */
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        /* IE/Edge */
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }

  /***
* Language Value Set
*/
  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
  }

  /**
 * Toggle the menu bar when having mobile screen
 */
  toggleMobileMenu(event: any) {
    document.querySelector('.hamburger-icon')?.classList.toggle('open')
    document.body.classList.contains("twocolumn-panel") ? document.body.classList.remove("twocolumn-panel") : document.body.classList.add("twocolumn-panel");
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  /**
* Topbar Light-Dark Mode Change
*/
  changeMode(mode: string) {
    this.mode = mode;
    this.store.dispatch(changeMode({ mode }));
    this.store.select(getLayoutMode).subscribe((mode) => {
      document.documentElement.setAttribute('data-bs-theme', mode)
      document.documentElement.classList.remove('mode-auto')
    })
    if (mode == 'auto') {
      this.store.select(getLayoutMode).subscribe((mode) => {
        document.documentElement.setAttribute('data-bs-theme', 'light')
        document.documentElement.classList.add('mode-auto')
      })
    }
  }

  // Buscador funcional
  Search(): void {
    const input = document.getElementById('search-options') as HTMLInputElement;
    const searchOptions = document.getElementById('search-close-options') as HTMLElement;
    const dropdown = document.getElementById('search-dropdown') as HTMLElement;

    const filter = input.value.trim();
    const inputLength = filter.length;

    if (inputLength >= 3) {
      // Ejecutar la búsqueda solo si el input tiene al menos 3 caracteres
      this.apiService.get(`pets?query=${filter}`, true).subscribe(
        (response) => {
          if (response.success) {
            this.searchResults = response.data;
            this.showSearchDropdown(response.data.length > 0);
          } else {
            this.searchResults = [];
            this.showSearchDropdown(false);
          }
        },
        (error) => {
          this.searchResults = [];
          this.showSearchDropdown(false);
          this.utilitiesService.showAlert('error', 'No se pudieron cargar las mascotas');
        }
      );

      searchOptions.classList.remove('d-none');
    } else {
      // Si el input tiene menos de 3 caracteres, cerrar el dropdown y ocultar la X de búsqueda
      this.showSearchDropdown(false);
      searchOptions.classList.add('d-none');
      this.searchResults = [];
    }
  }

  // Mostrar u ocultar el dropdown con resultados de búsqueda
  private showSearchDropdown(show: boolean): void {
    const dropdown = document.getElementById('search-dropdown') as HTMLElement;
    if (show) {
      dropdown.classList.add('show');
    } else {
      dropdown.classList.remove('show');
    }
  }

  // Función para navegar al perfil de la mascota al seleccionar un resultado
  goToPetProfile(petId: string): void {
    const encodedId = btoa(petId);
    this.router.navigate(['/pets/view', encodedId]);
    this.closeBtn();
  }

  closeBtn(): void {
    this.searchResults = [];
    this.showSearchDropdown(false);
    const searchOptions = document.getElementById(
      'search-close-options'
    ) as HTMLElement;
    searchOptions.classList.add('d-none');
    var searchInputReponsive = document.getElementById("search-options") as HTMLInputElement;
    searchInputReponsive.value = "";
  }


  // Increment Decrement Quantity
  qty: number = 0;
  increment(qty: any, i: any, id: any) {
    this.subtotal = 0;
    if (id == '0' && qty > 1) {
      qty--;
      this.cartData[i].qty = qty
      this.cartData[i].total = (this.cartData[i].qty * this.cartData[i].price).toFixed(2)
    }
    if (id == '1') {
      qty++;
      this.cartData[i].qty = qty
      this.cartData[i].total = (this.cartData[i].qty * this.cartData[i].price).toFixed(2)
    }

    this.cartData.map((x: any) => {
      this.subtotal += parseFloat(x['total'])
    })

    this.subtotal = this.subtotal.toFixed(2)
    this.discount = (this.subtotal * this.discountRate).toFixed(2)
    this.tax = (this.subtotal * this.taxRate).toFixed(2);
    this.totalsum = (parseFloat(this.subtotal) + parseFloat(this.tax) + parseFloat(this.shippingRate) - parseFloat(this.discount)).toFixed(2)
  }

  removeCart(id: any) {
    this.removeCartModal?.show()
    this.deleteid = id;
  }

  confirmDelete() {
    this.removeCartModal?.hide()

    this.subtotal -= this.cartData[this.deleteid].total
    this.subtotal = this.subtotal.toFixed(2)
    this.discount = (this.subtotal * this.discountRate).toFixed(2)
    this.tax = (this.subtotal * this.taxRate).toFixed(2);
    this.totalsum = (parseFloat(this.subtotal) + parseFloat(this.tax) + parseFloat(this.shippingRate) - parseFloat(this.discount)).toFixed(2)
    this.cartData.splice(this.deleteid, 1)
  }

  // Remove Notification
  checkedValGet: any[] = [];
  onCheckboxChange(event: any, id: any) {
    var checkedVal: any[] = [];
    var result
    for (var i = 0; i < this.notificationList.length; i++) {
      for (var x = 0; x < this.notificationList[i].items.length; x++) {
        if (this.notificationList[i].items[x].state == true) {
          result = this.notificationList[i].items[x].id;
          checkedVal.push(result);
        }
      }
    }
    this.checkedValGet = checkedVal
    checkedVal.length > 0 ? (document.getElementById("notification-actions") as HTMLElement).style.display = 'block' : (document.getElementById("notification-actions") as HTMLElement).style.display = 'none';
  }

  notificationDelete() {
    for (var i = 0; i < this.checkedValGet.length; i++) {
      for (var j = 0; j < this.notificationList.length; j++) {
        for (var x = 0; x < this.notificationList[j].items.length; x++) {
          if (this.notificationList[j].items[x].id == this.checkedValGet[i]) {
            this.notificationList[j].items.splice(x, 1)
          }
        }
      }
    }
    this.calculatenotification()
    this.removeNotificationModal?.hide();
  }

  calculatenotification() {
    this.totalNotify = 0;
    this.checkedValGet = []
    this.notificationList.forEach((element: any) => {
      this.totalNotify += element.items.length
      if (element.title == 'New') {
        this.newNotify = element.items.length
      } else {
        this.readNotify = element.items.length
      }
    });
    this.checkedValGet.length > 0 ? (document.getElementById("notification-actions") as HTMLElement).style.display = 'block' : (document.getElementById("notification-actions") as HTMLElement).style.display = 'none';
    if (this.totalNotify == 0) {
      document.querySelector('.empty-notification-elem')?.classList.remove('d-none')
    }
  }

  onLogout(e: Event) {
    e.preventDefault();
    localStorage.removeItem('isLoggedin');
    localStorage.removeItem('token');

    if (!localStorage.getItem('isLoggedin')) {
      this.router.navigate(['/auth/login']);
    }
  }

}