export type Language = 'TA' | 'EN';

export interface ServiceItem {
  name: string;
}

export interface HeaderTranslations {
  helpline: string;
  myProfile: string;
  logout: string;
  citizenLogin: string;
  title: string;
  subtitle: string;
}

export interface SidebarMenuTranslations {
  menu: string;
  familyMembers: string;
  myBookings: string;
  shopDetails: string;
  transactions: string;
  logout: string;
}

export interface ShopDetailsTranslations {
  title: string;
  shopName: string;
  shopCode: string;
  address: string;
  timings: string;
  location: string;
  weekdays: string;
  weekends: string;
}

export interface TransactionsTranslations {
  title: string;
  subtitle: string;
  date: string;
  invoiceNo: string;
  items: string;
  status: string;
  collected: string;
}

export interface LeftSidebarTranslations {
  complaintTitle: string;
  complaintPlaceholder: string;
  complaintSubmit: string;
  complaintSuccess: string;
  fpsServices: {
    title: string;
    items: {
      findShop: ServiceItem;
    };
  };
}

export interface MainContentTranslations {
  title: string;
  stats: {
    districts: string;
    taluks: string;
    shops: string;
    beneficiaries: string;
    rice: string;
    sugarKerosene: string;
  };
  complaint: {
    title: string;
    description: string;
  };
  cardStatus: {
    title: string;
    description: string;
  };
}

export interface RightSidebarTranslations {
  citizenServices: {
    title: string;
    items: {
      applyNewCard: ServiceItem;
      cardStatus: ServiceItem;
      registerGrievance: ServiceItem;
    };
  };
  cardServices: {
    title: string;
    items: {
      addMember: ServiceItem;
      changeAddress: ServiceItem;
      changeCardType: ServiceItem;
      removeMember: ServiceItem;
    };
  };
}

export interface HelplineTranslations {}

export interface MobileAppTranslations {
  title: string;
  publicApp: string;
  iosApp: string;
}

export interface FooterTranslations {
  actsAndPolicies: {
    title: string;
    links: {
      terms: string;
      privacy: string;
      disclaimer: string;
    };
  };
  quickLinks: {
    title: string;
    links: {
      home: string;
      about: string;
      contact: string;
    };
  };
  relatedDepartments: {
    title: string;
    links: {
      foodDept: string;
      tnGovt: string;
      nic: string;
    };
  };
  contact: {
    title: string;
  };
  copyright: string;
}

export interface LoginTranslations {
  title: string;
  subtitle: string;
  cardLabel: string;
  cardPlaceholder: string;
  otpLabel: string;
  otpPlaceholder: string;
  verifyButton: string;
  loginButton: string;
  processing: string;
  errorNoCard: string;
  errorInvalidOtp: string;
  scanSuccess: string;
}

export interface ProfileTranslations {
  title: string;
  subtitle: string;
  cardNumber: string;
  cardType: string;
  district: string;
  fpsCode: string;
  familyMembers: {
    title: string;
    subtitle: string;
    name: string;
    relation: string;
    age: string;
    gender: string;
  };
}

export interface BookingTranslations {
  title: string;
  description: string;
  allocationTitle: string;
  form: {
    dateLabel: string;
    datePlaceholder: string;
    slotLabel: string;
    slotPlaceholder: string;
    submit: string;
    submitting: string;
  };
  success: {
    title: string;
    description: string;
  };
  error: string;
}

export interface HomeLoggedInTranslations {
  welcome: string;
  rationServices: {
    title: string;
    description: string;
    button: string;
  };
  allocation: {
    title: string;
  };
}

export interface DataTranslations {
  items: Record<string, string>;
  relations: Record<string, string>;
  genders: Record<string, string>;
}

interface Translations {
  header: HeaderTranslations;
  sidebarMenu: SidebarMenuTranslations;
  shopDetails: ShopDetailsTranslations;
  transactions: TransactionsTranslations;
  leftSidebar: LeftSidebarTranslations;
  mainContent: MainContentTranslations;
  rightSidebar: RightSidebarTranslations;
  helpline: HelplineTranslations;
  mobileApp: MobileAppTranslations;
  footer: FooterTranslations;
  login: LoginTranslations;
  profile: ProfileTranslations;
  booking: BookingTranslations;
  homeLoggedIn: HomeLoggedInTranslations;
  data: DataTranslations;
}

export const translations: Record<Language, Translations> = {
  TA: {
    header: {
      helpline: 'உதவி எண்',
      myProfile: 'என் சுயவிவரம்',
      logout: 'வெளியேறு',
      citizenLogin: 'குடிமக்கள் உள்நுழைவு',
      title: 'பொது விநியோகத் திட்டம்',
      subtitle: 'தமிழ்நாடு அரசு',
    },
    sidebarMenu: {
      menu: 'மெனு',
      familyMembers: 'குடும்ப உறுப்பினர்கள்',
      myBookings: 'எனது முன்பதிவுகள்',
      shopDetails: 'கடை விவரங்கள்',
      transactions: 'பரிவர்த்தனை விவரங்கள்',
      logout: 'வெளியேறு',
    },
    shopDetails: {
      title: 'நியாய விலைக் கடை விவரங்கள்',
      shopName: 'கடை பெயர்',
      shopCode: 'கடை குறியீடு',
      address: 'முகவரி',
      timings: 'கடை திறந்திருக்கும் நேரம்',
      location: 'வரைபடத்தில் இடம்',
      weekdays: 'திங்கள் - சனி',
      weekends: 'ஞாயிறு',
    },
    transactions: {
      title: 'பரிவர்த்தனை வரலாறு',
      subtitle: 'உங்கள் கடந்தகால ரேஷன் சேகரிப்பு விவரங்கள்',
      date: 'தேதி',
      invoiceNo: 'பட்டியல் எண்',
      items: 'பொருட்கள்',
      status: 'நிலை',
      collected: 'சேகரிக்கப்பட்டது',
    },
    leftSidebar: {
      complaintTitle: 'புகார் பெட்டி',
      complaintPlaceholder: 'ரேஷன் கடைகளில் நீங்கள் எதிர்கொள்ளும் சிரமங்களை இங்கே விவரிக்கவும்...',
      complaintSubmit: 'சமர்ப்பி',
      complaintSuccess: 'உங்கள் புகார் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.',
      fpsServices: {
        title: 'FPS சேவைகள்',
        items: {
          findShop: { name: 'நியாய விலைக் கடையைக் கண்டறியவும்' },
        },
      },
    },
    mainContent: {
      title: 'செயல்படுத்தல் நிலைமை',
      stats: {
        districts: 'மாவட்டங்கள்',
        taluks: 'வட்டங்கள்',
        shops: 'நியாய விலைக் கடைகள்',
        beneficiaries: 'பயனாளிகள்',
        rice: 'அரிசி விநியோகம் (மெ.டன்)',
        sugarKerosene: 'சர்க்கரை / மண்ணெண்ணெய்',
      },
      complaint: {
        title: 'புகாரைப் பதிவு செய்ய',
        description: 'உங்கள் புகார்களை இங்கே பதிவு செய்யவும்',
      },
      cardStatus: {
        title: 'தங்கள் அட்டை நிலையை மாற்ற',
        description: 'உங்கள் அட்டை தொடர்பான கோரிக்கைகளின் நிலையை அறிய',
      },
    },
    rightSidebar: {
      citizenServices: {
        title: 'குடிமக்கள் மைய விவரங்கள்',
        items: {
          applyNewCard: { name: 'புதிய குடும்ப அட்டை விண்ணப்பிக்க' },
          cardStatus: { name: 'குடும்ப அட்டை நிலை' },
          registerGrievance: { name: 'குறை பதிவு' },
        },
      },
      cardServices: {
        title: 'அட்டை சேவைகள்',
        items: {
          addMember: { name: 'உறுப்பினரைச் சேர்' },
          changeAddress: { name: 'முகவரி மாற்றம்' },
          changeCardType: { name: 'அட்டை வகை மாற்றம்' },
          removeMember: { name: 'உறுப்பினரை நீக்கு' },
        },
      },
    },
    helpline: {},
    mobileApp: {
      title: 'இலவச செயலி பதிவிறக்கம் செய்ய',
      publicApp: 'பொது பயன்பாடு',
      iosApp: 'iOS செயலி',
    },
    footer: {
      actsAndPolicies: {
        title: 'சட்டங்கள் மற்றும் கொள்கைகள்',
        links: {
          terms: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
          privacy: 'தனியுரிமைக் கொள்கை',
          disclaimer: 'மறுதலிப்பு',
        },
      },
      quickLinks: {
        title: 'விரைவு இணைப்புகள்',
        links: {
          home: 'முகப்பு',
          about: 'பற்றி',
          contact: 'தொடர்புக்கு',
        },
      },
      relatedDepartments: {
        title: 'தொடர்புடைய துறைகள்',
        links: {
          foodDept: 'உணவு மற்றும் நுகர்வோர் பாதுகாப்பு',
          tnGovt: 'தமிழ்நாடு அரசு',
          nic: 'தேசிய தகவல் மையம்',
        },
      },
      contact: {
        title: 'தொடர்பு விவரங்கள்',
      },
      copyright: 'TN-PDS போர்டல். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    },
    login: {
      title: 'குடிமக்கள் உள்நுழைவு',
      subtitle: 'உங்கள் ரேஷன் ஸ்மார்ட் கார்டைப் பயன்படுத்தி உள்நுழையவும்',
      cardLabel: 'ஸ்மார்ட் கார்டு எண்',
      cardPlaceholder: 'ஸ்மார்ட் கார்டு எண்ணை உள்ளிடவும்',
      otpLabel: '6 இலக்கக் குறியீட்டை உள்ளிடவும்',
      otpPlaceholder: '******',
      verifyButton: 'சரிபார்க்கவும்',
      loginButton: 'சரிபார்த்து உள்நுழைக',
      processing: 'செயலாக்கப்படுகின்றன...',
      errorNoCard: 'ஸ்மார்ட் கார்டு பதிவு செய்யப்படவில்லை.',
      errorInvalidOtp: 'தவறான குறியீடு. மீண்டும் முயற்சிக்கவும்.',
      scanSuccess: 'ஸ்மார்ட் கார்டு எண் வெற்றிகரமாக ஸ்கேன் செய்யப்பட்டது.',
    },
    profile: {
      title: 'குடும்பத் தலைவரின் சுயவிவரம்',
      subtitle: 'குடும்பத் தலைவர் விவரங்கள்',
      cardNumber: 'அட்டை எண்',
      cardType: 'அட்டை வகை',
      district: 'மாவட்டம்',
      fpsCode: 'நியாய விலைக் கடை எண்',
      familyMembers: {
        title: 'குடும்ப உறுப்பினர்கள்',
        subtitle: 'இந்த ஸ்மார்ட் கார்டின் கீழ் பதிவுசெய்யப்பட்ட உறுப்பினர்களின் பட்டியல்.',
        name: 'பெயர்',
        relation: 'உறவு',
        age: 'வயது',
        gender: 'பாலினம்',
      },
    },
    booking: {
      title: 'ரேஷன் தேர்வு மற்றும் நேர ஒதுக்கீடு முன்பதிவு',
      description: 'உங்கள் உருப்படிகளை உறுதிசெய்து நேரத்தை முன்பதிவு செய்யுங்கள்.',
      allocationTitle: 'உங்கள் மாதாந்திர ரேஷன் ஒதுக்கீடு',
      form: {
        dateLabel: 'சேகரிப்பு தேதியைத் தேர்வுசெய்க',
        datePlaceholder: 'தேதியைத் தேர்ந்தெடுக்கவும்',
        slotLabel: 'சேகரிப்பு நேரத்தைத் தேர்வுசெய்க',
        slotPlaceholder: 'நேரத்தைத் தேர்ந்தெடுக்கவும்',
        submit: 'முன்பதிவை உறுதிப்படுத்து',
        submitting: 'முன்பதிவு செய்யப்படுகிறது...',
      },
      success: {
        title: 'முன்பதிவு உறுதி செய்யப்பட்டது!',
        description: 'உங்கள் முன்பதிவு உறுதி செய்யப்பட்டுள்ளது.',
      },
      error: 'முன்பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
    },
    homeLoggedIn: {
      welcome: 'வரவேற்கிறோம்',
      rationServices: {
        title: 'ரேஷன் சேவைகள்',
        description: 'உங்கள் ரேஷன் சேகரிப்பு மற்றும் முன்பதிவுகளை நிர்வகிக்கவும்.',
        button: 'ரேஷன் தேர்வு மற்றும் நேர ஒதுக்கீடு முன்பதிவு',
      },
      allocation: {
        title: 'மாதாந்திர ரேஷன் ஒதுக்கீடு',
      },
    },
    data: {
      items: {
        rawRice: 'பச்சரிசி',
        boiledRice: 'புழுங்கல் அரிசி',
        wheat: 'கோதுமை',
        sugar: 'சர்க்கரை',
        palmOil: 'பாமாயில்',
        toorDal: 'துவரம் பருப்பு',
      },
      relations: {
        Head: 'தலைவர்',
        Wife: 'மனைவி',
        Daughter: 'மகள்',
        Son: 'மகன்',
        Husband: 'கணவன்',
        Father: 'தந்தை',
        Mother: 'தாய்',
      },
      genders: {
        Male: 'ஆண்',
        Female: 'பெண்',
        Other: 'மற்றவை',
      },
    },
  },
  EN: {
    header: {
      helpline: 'Helpline',
      myProfile: 'My Profile',
      logout: 'Logout',
      citizenLogin: 'Citizen Login',
      title: 'Public Distribution System',
      subtitle: 'Government of Tamil Nadu',
    },
    sidebarMenu: {
      menu: 'Menu',
      familyMembers: 'Family Members',
      myBookings: 'My Bookings',
      shopDetails: 'Shop Details',
      transactions: 'Transactions',
      logout: 'Logout',
    },
    shopDetails: {
      title: 'Fair Price Shop Details',
      shopName: 'Shop Name',
      shopCode: 'Shop Code',
      address: 'Address',
      timings: 'Shop Operating Hours',
      location: 'Location on Map',
      weekdays: 'Mon - Sat',
      weekends: 'Sunday',
    },
    transactions: {
      title: 'Transaction History',
      subtitle: 'Details of your past ration collections',
      date: 'Date',
      invoiceNo: 'Invoice No',
      items: 'Items',
      status: 'Status',
      collected: 'Collected',
    },
    leftSidebar: {
      complaintTitle: 'Complaint Box',
      complaintPlaceholder: 'Describe inconveniences faced at ration shops...',
      complaintSubmit: 'Submit',
      complaintSuccess: 'Your complaint has been submitted successfully.',
      fpsServices: {
        title: 'FPS Services',
        items: {
          findShop: { name: 'Find Fair Price Shop' },
        },
      },
    },
    mainContent: {
      title: 'Implementation Status',
      stats: {
        districts: 'Districts',
        taluks: 'Taluks',
        shops: 'Fair Price Shops',
        beneficiaries: 'Beneficiaries',
        rice: 'Rice Distribution (MT)',
        sugarKerosene: 'Sugar / Kerosene',
      },
      complaint: {
        title: 'Register a Complaint',
        description: 'Register your complaints here',
      },
      cardStatus: {
        title: 'Track Your Card Status',
        description: 'Know the status of your card related requests',
      },
    },
    rightSidebar: {
      citizenServices: {
        title: 'Citizen Center Details',
        items: {
          applyNewCard: { name: 'Apply for a New Family Card' },
          cardStatus: { name: 'Family Card Status' },
          registerGrievance: { name: 'Register Grievance' },
        },
      },
      cardServices: {
        title: 'Card Services',
        items: {
          addMember: { name: 'Add Member' },
          changeAddress: { name: 'Change Address' },
          changeCardType: { name: 'Change Card Type' },
          removeMember: { name: 'Remove Member' },
        },
      },
    },
    helpline: {},
    mobileApp: {
      title: 'Download Free App',
      publicApp: 'Public App',
      iosApp: 'iOS App',
    },
    footer: {
      actsAndPolicies: {
        title: 'Acts & Policies',
        links: {
          terms: 'Terms and Conditions',
          privacy: 'Privacy Policy',
          disclaimer: 'Disclaimer',
        },
      },
      quickLinks: {
        title: 'Quick Links',
        links: {
          home: 'Home',
          about: 'About',
          contact: 'Contact',
        },
      },
      relatedDepartments: {
        title: 'Related Departments',
        links: {
          foodDept: 'Food and Consumer Protection',
          tnGovt: 'Government of Tamil Nadu',
          nic: 'National Informatics Centre',
        },
      },
      contact: {
        title: 'Contact Details',
      },
      copyright: 'TN-PDS Portal. All Rights Reserved.',
    },
    login: {
      title: 'Citizen Login',
      subtitle: 'Login using your Ration Smart Card',
      cardLabel: 'Smart Card Number',
      cardPlaceholder: 'Enter Smart Card Number',
      otpLabel: 'Enter 6-digit Code',
      otpPlaceholder: '******',
      verifyButton: 'Verify',
      loginButton: 'Verify & Login',
      processing: 'Processing...',
      errorNoCard: 'Smart Card not registered.',
      errorInvalidOtp: 'Invalid code. Please try again.',
      scanSuccess: 'Smart Card number scanned successfully.',
    },
    profile: {
      title: 'Head of Family Profile',
      subtitle: 'Head of Family details',
      cardNumber: 'Card Number',
      cardType: 'Card Type',
      district: 'District',
      fpsCode: 'FPS Shop Code',
      familyMembers: {
        title: 'Family Members',
        subtitle: 'List of members registered under this smart card.',
        name: 'Name',
        relation: 'Relation',
        age: 'Age',
        gender: 'Gender',
      },
    },
    booking: {
      title: 'Ration Selection & Time Slot Booking',
      description: 'Confirm your items and book a collection slot.',
      allocationTitle: 'Your Monthly Ration Allocation',
      form: {
        dateLabel: 'Choose Collection Date',
        datePlaceholder: 'Pick a date',
        slotLabel: 'Choose Collection Slot',
        slotPlaceholder: 'Select a time slot',
        submit: 'Confirm Booking',
        submitting: 'Booking...',
      },
      success: {
        title: 'Booking Confirmed!',
        description: 'Your booking has been confirmed.',
      },
      error: 'Booking failed. Please try again.',
    },
    homeLoggedIn: {
      welcome: 'Welcome',
      rationServices: {
        title: 'Ration Services',
        description: 'Manage your ration collection and bookings.',
        button: 'Ration Selection & Time Slot Booking',
      },
      allocation: {
        title: 'Monthly Ration Allocation',
      },
    },
    data: {
      items: {
        rawRice: 'Raw Rice',
        boiledRice: 'Boiled Rice',
        wheat: 'Wheat',
        sugar: 'Sugar',
        palmOil: 'Palm Oil',
        toorDal: 'Toor Dal',
      },
      relations: {
        Head: 'Head',
        Wife: 'Wife',
        Daughter: 'Daughter',
        Son: 'Son',
        Husband: 'Husband',
        Father: 'Father',
        Mother: 'Mother',
      },
      genders: {
        Male: 'Male',
        Female: 'Female',
        Other: 'Other',
      },
    },
  },
};
