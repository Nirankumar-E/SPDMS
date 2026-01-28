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

interface Translations {
  header: HeaderTranslations;
  leftSidebar: LeftSidebarTranslations;
  mainContent: MainContentTranslations;
  rightSidebar: RightSidebarTranslations;
  helpline: HelplineTranslations;
  mobileApp: MobileAppTranslations;
  footer: FooterTranslations;
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
      publicApp: 'Public App',
      iosApp: 'iOS App',
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
      copyright: 'TN-PDS Portal. All Rights Reserved.',
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
  },
};