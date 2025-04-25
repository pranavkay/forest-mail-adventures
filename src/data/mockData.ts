
export interface Contact {
  id: string;
  name: string;
  woodlandName: string;
  email: string;
  avatar: string;
  animal: 'fox' | 'rabbit' | 'owl' | 'squirrel' | 'cat' | 'dog' | 'bird';
}

export interface Email {
  id: string;
  from: Contact;
  subject: string;
  body: string;
  received: string;
  read: boolean;
}

export interface Folder {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

export const contacts: Contact[] = [
  {
    id: '1',
    name: 'Felix Thompson',
    woodlandName: 'Fiona Fox',
    email: 'felix@forest-mail.com',
    avatar: '/avatar-fox.png',
    animal: 'fox'
  },
  {
    id: '2',
    name: 'Rachel Bennett',
    woodlandName: 'Ruby Rabbit',
    email: 'rachel@forest-mail.com',
    avatar: '/avatar-rabbit.png',
    animal: 'rabbit'
  },
  {
    id: '3',
    name: 'Oliver Chen',
    woodlandName: 'Oliver Owl',
    email: 'oliver@forest-mail.com',
    avatar: '/avatar-owl.png',
    animal: 'owl'
  },
  {
    id: '4',
    name: 'Sarah Parker',
    woodlandName: 'Sam Squirrel',
    email: 'sarah@forest-mail.com',
    avatar: '/avatar-squirrel.png',
    animal: 'squirrel'
  },
  {
    id: '5',
    name: 'Clara Johnson',
    woodlandName: 'Clara Cat',
    email: 'clara@forest-mail.com',
    avatar: '/avatar-cat.png',
    animal: 'cat'
  }
];

export const emails: Email[] = [
  {
    id: '1',
    from: contacts[0],
    subject: 'Forest picnic tomorrow?',
    body: 'Hello friend! I was wondering if you would like to join our forest picnic tomorrow at noon? Bring your favorite treats!',
    received: '2023-04-24T10:30:00',
    read: false
  },
  {
    id: '2',
    from: contacts[1],
    subject: 'Carrot garden update',
    body: 'The carrots are growing wonderfully! I think we\'ll have a bountiful harvest this season. Would you like some?',
    received: '2023-04-23T15:45:00',
    read: true
  },
  {
    id: '3',
    from: contacts[2],
    subject: 'Nighttime forest tour',
    body: 'I\'m organizing a nighttime tour of the forest this weekend. It\'s a perfect opportunity to see the stars and nocturnal creatures!',
    received: '2023-04-22T21:15:00',
    read: true
  },
  {
    id: '4',
    from: contacts[3],
    subject: 'Acorn collection tips',
    body: 'I\'ve written a small guide on the best ways to collect and store acorns for the winter. Let me know if you\'d like a copy!',
    received: '2023-04-21T09:10:00',
    read: false
  },
  {
    id: '5',
    from: contacts[4],
    subject: 'Sunny spot by the river',
    body: 'I found the most perfect sunny spot by the river for napping. We should meet there sometime!',
    received: '2023-04-20T14:25:00',
    read: true
  }
];

export const folders: Folder[] = [
  {
    id: 'inbox',
    name: 'Leaf Pile',
    count: 3,
    icon: 'leaf'
  },
  {
    id: 'sent',
    name: 'Sent Butterflies',
    count: 0,
    icon: 'bird'
  },
  {
    id: 'drafts',
    name: 'Mushroom Pocket',
    count: 2,
    icon: 'book'
  },
  {
    id: 'archive',
    name: 'Acorn Collection',
    count: 8,
    icon: 'archive'
  },
  {
    id: 'trash',
    name: 'Beaver\'s Recycling',
    count: 0,
    icon: 'trash-2'
  }
];

export const animalGuides = [
  {
    id: 'new-email',
    name: 'Hedgehog Helper',
    tip: 'To create a new message, click the butterfly at the bottom right!',
    shown: false
  },
  {
    id: 'folders',
    name: 'Wise Owl',
    tip: 'Your emails are organized in branch folders on the left side. Click a branch to see what\'s inside!',
    shown: false
  },
  {
    id: 'search',
    name: 'Detective Fox',
    tip: 'Looking for a specific message? Use the search bar to hunt it down!',
    shown: false
  }
];
