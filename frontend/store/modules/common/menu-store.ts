import { action, createModule, mutation } from 'vuex-class-component'

export const VuexModule = createModule({
  namespaced: 'menu',
  strict: false,
  target: 'nuxt'
})

export class MenuItem {
  id: string = ''
  icon: string = ''
  label: string = ''
  to: string = ''
  subs: Array<MenuItem> = []
}

/**
 * Menu has two levels or is hidden. Css class change visibility or each level and space taken by main component.
 * For example if both levels are expanded then main conent is move more to right, css calculation is done in scss.
 */
export class MenuStore extends VuexModule {
  readonly subHiddenBreakpoint: number = 1440
  readonly menuHiddenBreakpoint: number = 768

  readonly CSS_MENU_HIDDEN: string = 'menu-hidden menu-sub-hidden'
  readonly CSS_MENU_SHOW_FIRST_LEVEL: string = 'main-show-temporary menu-sub-hidden'
  readonly CSS_MENU_SHOW_SECOND_LEVEL: string = 'menu-default'

  readonly MENU_STATE_HIDDEN = 1
  readonly MENU_STATE_SHOW_FIRST_LEVEL = 2
  readonly MENU_STATE_SHOW_SECOND_LEVEL = 3

  menuState = this.MENU_STATE_HIDDEN
  menuType: string = this.CSS_MENU_HIDDEN

  selectedParentMenu: string = ''
  viewingParentMenu: string = ''

  menuItems: Array<MenuItem> = []

  clickCount: number = 0
  menuClickCount: number = 0
  selectedMenuHasSubItems: boolean = false

  @mutation
  hideMenu () {
    this.menuType = this.CSS_MENU_HIDDEN
    this.menuState = this.MENU_STATE_HIDDEN
    this.viewingParentMenu = ''
  }

  @mutation
  changeSideMenuStatus () {
    if (this.menuState == this.MENU_STATE_HIDDEN) {
      this.menuType = this.CSS_MENU_SHOW_FIRST_LEVEL
      this.menuState = this.MENU_STATE_SHOW_FIRST_LEVEL
    } else {
      this.menuType = this.CSS_MENU_HIDDEN
      this.menuState = this.MENU_STATE_HIDDEN
      this.viewingParentMenu = ''
    }
  }

  @mutation
  changeSelectedMenuHasSubItems (payload: boolean) {
    this.selectedMenuHasSubItems = payload
  }

  @mutation
  addMenuClassname (payload: { className: string, currentClasses: string }) {
    const { className, currentClasses } = payload
    this.menuType = !(currentClasses.includes(className))
      ? currentClasses + ' ' + className
      : currentClasses
  }

  @mutation
  changeSelectedParentHasNoSubmenu (parentMenu: string) {
    this.selectedParentMenu = parentMenu
    this.viewingParentMenu = parentMenu
    this.selectedMenuHasSubItems = false
  }

  @mutation
  addMenuItem (menuItem: MenuItem) {
    this.menuItems.push(menuItem)
  }

  @mutation
  clearMenuItems () {
    this.menuItems = []
  }

  @action
  async mounted () {
    const dashboard: MenuItem = new MenuItem()
    dashboard.id = 'dashboard'
    dashboard.icon = 'layout-sidebar'
    dashboard.label = 'menu.dashboard'
    dashboard.to = '/app/dashboard'

    const utils: MenuItem = new MenuItem()
    utils.id = 'utils'
    utils.icon = 'collection'
    utils.label = 'menu.utils'
    utils.to = '/'

    const utilToDo: MenuItem = new MenuItem()
    utilToDo.id = 'utils-todo'
    utilToDo.icon = 'card-checklist'
    utilToDo.label = 'menu.utils-todo'
    utilToDo.to = '/app/todo'

    const utilUpload: MenuItem = new MenuItem()
    utilUpload.id = 'utils-upload'
    utilUpload.icon = 'cloud-upload'
    utilUpload.label = 'menu.utils-upload'
    utilUpload.to = '/app/upload'

    const search: MenuItem = new MenuItem()
    search.id = 'utils-search'
    search.icon = 'search'
    search.label = 'menu.utils-search'
    search.to = '/app/search'

    utils.subs.push(utilToDo)
    utils.subs.push(utilUpload)
    utils.subs.push(search)

    const logout: MenuItem = new MenuItem()
    logout.id = 'logout'
    logout.icon = 'house'
    logout.label = 'menu.logout'
    logout.to = '/logout'

    const appointment: MenuItem = new MenuItem()
    appointment.id = 'appointment'
    appointment.icon = 'calendar-range'
    appointment.label = 'menu.appointment'
    appointment.to = '/app/appointment'

    this.clearMenuItems()
    this.addMenuItem(dashboard)
    this.addMenuItem(utils)
    this.addMenuItem(appointment)
    this.addMenuItem(logout)

    this.selectMenu()
    window.addEventListener('resize', this.handleWindowResize)
    document.addEventListener('click', this.handleDocumentClick)
  }

  @action
  async beforeDestroy () {
    document.removeEventListener('click', this.handleDocumentClick)
    window.removeEventListener('resize', this.handleWindowResize)
  }

  @action
  async selectMenu () {
    this.changeSelection({ selectedParentMenu: '/', viewingParentMenu: this.viewingParentMenu })
    await this.isCurrentMenuHasSubItem()
  }

  @action
  async isCurrentMenuHasSubItem () {
    const menuItem = this.menuItems.find(
      x => x.id === this.selectedParentMenu
    )
    const isCurrentMenuHasSubItem = !!(menuItem && menuItem.subs && menuItem.subs.length > 0)
    if (isCurrentMenuHasSubItem != this.selectedMenuHasSubItems) {
      if (!isCurrentMenuHasSubItem) {
        this.changeSideMenuStatus()
      } else {
        this.changeSideMenuStatus()
      }
    }
    return isCurrentMenuHasSubItem
  }

  @action
  async openSubMenu (menuItem: MenuItem) {
    const selectedParent = menuItem.id
    const hasSubMenu = menuItem.subs && menuItem.subs.length > 0
    this.changeSelectedMenuHasSubItems(hasSubMenu)

    if (!hasSubMenu) {
      this.changeSelection({ selectedParentMenu: selectedParent, viewingParentMenu: selectedParent })
    } else if (this.viewingParentMenu === selectedParent) {
      this.changeMenuAfterOpening({
        menuType: this.CSS_MENU_SHOW_FIRST_LEVEL,
        menuState: this.MENU_STATE_SHOW_FIRST_LEVEL,
        viewingParentMenu: ''
      })
    } else {
      this.changeMenuAfterOpening({
        menuType: this.CSS_MENU_SHOW_SECOND_LEVEL,
        menuState: this.MENU_STATE_SHOW_SECOND_LEVEL,
        viewingParentMenu: selectedParent
      })
    }
  }

  @mutation
  changeMenuAfterOpening (payload: {menuType: string, menuState: number, viewingParentMenu: string}) {
    this.menuType = payload.menuType
    this.menuState = payload.menuState
    this.viewingParentMenu = payload.viewingParentMenu
  }

  @mutation
  changeSelection (payload: {viewingParentMenu: string, selectedParentMenu:string }) {
    this.viewingParentMenu = payload.viewingParentMenu
    this.selectedParentMenu = payload.selectedParentMenu
  }

  @action
  async handleDocumentClick () {
    this.changeSelection({ viewingParentMenu: '', selectedParentMenu: this.selectedParentMenu })
    await this.hideMenu()
  }

  @action
  async handleWindowResize (event: { isTrusted: any; }) {
    if (event && !event.isTrusted) {
      return
    }
    const nextClasses = await this.getMenuClassesForResize(this.menuType)
    // this.changeSideMenuStatus();
  }

  @action
  async getMenuClassesForResize (classes: string) {
    let nextClasses = classes.split(' ').filter(x => x !== '')
    const windowWidth = window.innerWidth

    if (windowWidth < this.menuHiddenBreakpoint) {
      nextClasses.push('menu-mobile')
    } else if (windowWidth < this.subHiddenBreakpoint) {
      nextClasses = nextClasses.filter(x => x !== 'menu-mobile')
      if (
        nextClasses.includes('menu-default') &&
        !nextClasses.includes('menu-sub-hidden')
      ) {
        nextClasses.push('menu-sub-hidden')
      }
    } else {
      nextClasses = nextClasses.filter(x => x !== 'menu-mobile')
      if (
        nextClasses.includes('menu-default') &&
        nextClasses.includes('menu-sub-hidden')
      ) {
        nextClasses = nextClasses.filter(x => x !== 'menu-sub-hidden')
      }
    }
    return nextClasses
  }

  @action
  async onChangeSelectedParentHasNoSubmenu (parentMenu: string) {
    this.changeSelectedParentHasNoSubmenu(parentMenu)
    this.changeSideMenuStatus()
  }

  @action
  async onAnyItemClick (parentMenu: string) {
    this.hideMenu()
  }
}
