export const PREFERENCE_STEPS = [
  {
    key: 'travel_style',
    multiSelect: true,
    title: '여행 스타일이\n어떻게 되시나요?',
    subtitle: '평소 선호하는 여행 방식을 모두 선택해주세요',
    options: [
      { label: '힐링',     value: '힐링',     icon: 'leaf-outline',       desc: '조용히 쉬고 싶어요' },
      { label: '액티비티', value: '액티비티', icon: 'bicycle-outline',    desc: '활동적인 여행을 즐겨요' },
      { label: '관광',     value: '관광',     icon: 'map-outline',        desc: '명소를 두루 둘러봐요' },
      { label: '맛집',     value: '맛집',     icon: 'restaurant-outline', desc: '맛있는 음식이 최고예요' },
    ],
  },
  {
    key: 'environment',
    multiSelect: false,
    title: '어떤 환경을\n선호하시나요?',
    subtitle: '더 즐기는 여행 환경을 선택해주세요',
    options: [
      { label: '자연', value: '자연', icon: 'partly-sunny-outline', desc: '산, 바다, 숲 등 자연 속으로' },
      { label: '도심', value: '도심', icon: 'business-outline',     desc: '도시의 활기와 편리함을 선호해요' },
    ],
  },
  {
    key: 'accommodation',
    multiSelect: true,
    title: '선호하는 숙소\n유형은 무엇인가요?',
    subtitle: '편안한 여행을 위한 숙소를 모두 선택해주세요',
    options: [
      { label: '호텔',        value: '호텔',        icon: 'bed-outline',     desc: '편리한 서비스와 시설' },
      { label: '펜션',        value: '펜션',        icon: 'home-outline',    desc: '아늑하고 프라이빗한 공간' },
      { label: '게스트하우스', value: '게스트하우스', icon: 'people-outline',  desc: '여행자들과 교류해요' },
      { label: '캠핑',        value: '캠핑',        icon: 'bonfire-outline', desc: '자연 속에서 야외 숙박' },
    ],
  },
  {
    key: 'interest',
    multiSelect: true,
    title: '특별한 관심사가\n있으신가요?',
    subtitle: '여행에서 즐기는 활동을 모두 선택해주세요',
    options: [
      { label: '사진',      value: '사진',      icon: 'camera-outline',  desc: '인생샷을 남겨요' },
      { label: '역사',      value: '역사',      icon: 'library-outline', desc: '역사와 문화를 탐방해요' },
      { label: '카페',      value: '카페',      icon: 'cafe-outline',    desc: '분위기 좋은 카페 투어' },
      { label: '쇼핑',      value: '쇼핑',      icon: 'bag-outline',     desc: '여행지 쇼핑이 즐거워요' },
      { label: '로컬 문화', value: '로컬 문화', icon: 'earth-outline',   desc: '현지 문화를 경험해요' },
    ],
  },
  {
    key: 'travel_frequency',
    multiSelect: false,
    title: '얼마나 자주\n여행을 떠나시나요?',
    subtitle: '평소 여행 빈도를 알려주세요',
    options: [
      { label: '월 1회',   value: '월 1회',   icon: 'calendar-outline', desc: '매달 여행을 즐겨요' },
      { label: '분기 1회', value: '분기 1회', icon: 'time-outline',     desc: '3개월에 한 번 정도' },
      { label: '연 1~2회', value: '연 1~2회', icon: 'airplane-outline', desc: '1년에 한두 번 특별하게' },
    ],
  },
];
