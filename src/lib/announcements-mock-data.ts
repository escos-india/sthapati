interface Announcement {
  id: string;
  title: string;
  date: string;
  status: 'Published' | 'Draft';
  content: string;
}

const previousAnnouncements: Announcement[] = [];

export default previousAnnouncements;
