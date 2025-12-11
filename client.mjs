console.clear()
const base = 'http://localhost:3000';

const functions = {
  async postCourses() {
    const response = await fetch(base + '/lms/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: 'Html-e-css',
        title: 'HTML e CSS',
        description: 'HTML and CSS course for beginners',
        lessons: 40,
        hours: 10,
      }),
    });
    const body = await response.json();
    console.table(body);
    console.log("------------END------------");
  },

  async postLessons() {
    const response = await fetch(base + '/lms/lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseSlug: 'Html-e-css',
        slug: 'basic-tags',
        title: 'Basic Tags',
        seconds: 200,
        // video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        video: '/html/basic-tags.mp4',
        description: 'Basic tags of HTML',
        order: 1,
        free: 1,
      }),
    });
    const body = await response.json();
    console.table(body);
    console.log("------------END------------");
  },
}

functions[process.argv[2]]();