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
    const response = await fetch(base + '/lms/course/html-e-css', {
      method: 'GET',
    });
    const body = await response.json();
    console.log(body);
  },

  async getLesson() {
    const response = await fetch(base + '/lms/lesson/html-e-css/basic-tags', {
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
      body: JSON.stringify({ name: 'Felipe Panizio', username: 'fpanizio', email: 'panizio@gmail.com', password: '123456' }),
    });
    const body = await response.json();
    console.log(body);
  },

  async postLessonCompleted() {
    const response = await fetch(base + '/lms/lesson/completed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseId: 1, lessonId: 1 }),
    });
    const body = await response.json();
    console.log(body);
  },

  async resetCourse() {
    const response = await fetch(base + '/lms/course/reset', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseId: 1 }),
    });
    const body = await response.json();
    console.log(body);
  },

  async getCertificates() {
    const response = await fetch(base + '/lms/certificates/', {
      method: 'GET',
    });
    const body = await response.json();
    console.log(body);
  },

  async getCertificate() {
    const response = await fetch(base + '/lms/certificate/d90f2a4db7e54ff1', {
      method: 'GET',
    });
    const body = await response.json();
    console.log(body);
  },
}

functions[process.argv[2]]();