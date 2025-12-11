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
  },

  async getCourses() {
    const response = await fetch(base + '/lms/courses', {
      method: 'GET',
    });
    const body = await response.json();
    console.log(body);
  },

  async getCourse() {
    const response = await fetch(base + '/lms/course/javascript-completo', {
      method: 'GET',
    });
    const body = await response.json();
    console.log(body);
  },

  async getLesson() {
    const response = await fetch(base + '/lms/lesson/javascript-completo/funcoes-basico', {
      method: 'GET',
    });
    const body = await response.json();
    console.log(body);
  },


  async postUser() {
    const response = await fetch(base + '/auth/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Felipe Panizio', username: 'felipe', email: 'fpanizio@gmail.com', password: '123456' }),
    });
    const body = await response.json();
    console.log(body);
  },
}

functions[process.argv[2]]();