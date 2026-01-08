import { Api } from '../../core/utils/abstract.ts';
import { lmsTables } from './tables.ts';
import { RouteError } from '../../core/utils/route-error.ts';
import { LmsQuery } from './query.ts';
import { AuthMiddleware } from '../auth/middleware/auth.ts';
import { v } from '../../core/utils/validate.ts';

export class LmsApi extends Api {
  query = new LmsQuery(this.db);
  auth = new AuthMiddleware(this.core);

  handlers = {
    postCourse: (req, res) => {
      if (!req.session) throw new RouteError('Unauthorized', 401);

      const { slug, title, description, lessons, hours } = {
        slug: v.string(req.body.slug),
        title: v.string(req.body.title),
        description: v.string(req.body.description),
        lessons: v.number(req.body.lessons),
        hours: v.number(req.body.hours),
      };
      const writeResult = this.query.insertCourse({
        slug,
        title,
        description,
        lessons,
        hours,
      });
      if (writeResult.changes === 0) {
        throw new RouteError('Course already exists', 400);
      }
      res
        .status(201)
        .json({ id: writeResult.lastInsertRowid, title: 'Created course' });
    },

    postLesson: (req, res) => {
      if (!req.session) throw new RouteError('Unauthorized', 401);
      const {
        courseSlug,
        slug,
        title,
        seconds,
        video,
        description,
        order,
        free,
      } = {
        courseSlug: v.string(req.body.courseSlug),
        slug: v.string(req.body.slug),
        title: v.string(req.body.title),
        seconds: v.number(req.body.seconds),
        video: v.string(req.body.video),
        description: v.string(req.body.description),
        order: v.number(req.body.order),
        free: v.number(req.body.free),
      };

      const writeResult = this.query.insertLesson({
        courseSlug,
        slug,
        title,
        seconds,
        video,
        description,
        order,
        free,
      });

      if (writeResult.changes === 0) {
        throw new RouteError('Lesson already exists', 400);
      }
      res
        .status(201)
        .json({ id: writeResult.lastInsertRowid, title: 'Created lesson' });
    },

    putCourse: (req, res) => {
      if (!req.session) throw new RouteError('Unauthorized', 401);

      const { slug } = req.params;
      const { title, description, lessons, hours } = {
        title: req.body.title ? v.string(req.body.title) : undefined,
        description: req.body.description ? v.string(req.body.description) : undefined,
        lessons: req.body.lessons ? v.number(req.body.lessons) : undefined,
        hours: req.body.hours ? v.number(req.body.hours) : undefined,
      };

      const course = this.query.selectCourseBySlug(slug);
      if (!course) {
        throw new RouteError('Course not found', 404);
      }

      const writeResult = this.query.updateCourse({
        slug,
        title,
        description,
        lessons,
        hours,
      });

      if (writeResult.changes === 0) {
        throw new RouteError('Failed to update course', 400);
      }

      res.status(200).json({ title: 'Course updated' });
    },

    putLesson: (req, res) => {
      if (!req.session) throw new RouteError('Unauthorized', 401);

      const { id } = req.params;
      const lessonId = v.number(id);

      const { slug, title, seconds, video, description, order, free } = {
        slug: req.body.slug ? v.string(req.body.slug) : undefined,
        title: req.body.title ? v.string(req.body.title) : undefined,
        seconds: req.body.seconds ? v.number(req.body.seconds) : undefined,
        video: req.body.video ? v.string(req.body.video) : undefined,
        description: req.body.description ? v.string(req.body.description) : undefined,
        order: req.body.order ? v.number(req.body.order) : undefined,
        free: req.body.free !== undefined ? v.number(req.body.free) : undefined,
      };

      const writeResult = this.query.updateLesson({
        id: lessonId,
        slug,
        title,
        seconds,
        video,
        description,
        order,
        free,
      });

      if (writeResult.changes === 0) {
        throw new RouteError('Lesson not found', 404);
      }

      res.status(200).json({ title: 'Lesson updated' });
    },

    getCourses: (req, res) => {
      const courses = this.query.selectCourses();
      if (courses.length === 0) {
        throw new RouteError('No courses found', 404);
      }
      res.status(200).json(courses);
    },

    getLessons: (req, res) => {
      const lessons = this.query.selectAllLessons();
      if (lessons.length === 0) {
        throw new RouteError('No lessons found', 404);
      }
      res.status(200).json(lessons);
    },

    getCourse: (req, res) => {
      const { slug } = req.params;
      const course = this.query.selectCourseBySlug(slug);
      const lessons = this.query.selectLessonsBySlug(slug);
      if (!course) {
        throw new RouteError('Course not found', 404);
      }

      let completed: { lesson_id: number; completed: string }[] = [];
      if (req.session) {
        completed = this.query.selectLessonsCompleted(
          req.session.user_id,
          course.id
        );
      }

      res.status(200).json({ course, lessons, completed });
    },

    getLesson: (req, res) => {
      const { courseSlug, lessonSlug } = req.params;
      const lesson = this.query.selectLesson(courseSlug, lessonSlug);
      const nav = this.query.selectLessonNav(courseSlug, lessonSlug);
      if (!lesson) {
        throw new RouteError('Lesson not found', 404);
      }

      const i = nav.findIndex((item) => item.slug === lesson.slug);
      const prev = i === 0 ? null : nav.at(i - 1)?.slug;
      const next = nav.at(i + 1)?.slug ?? null;

      let completed = '';
      if (req.session) {
        const lessonCompleted = this.query.selectLessonCompleted(
          req.session.user_id,
          lesson.id
        );
        if (lessonCompleted) {
          completed = lessonCompleted.completed;
        }
      }

      res.status(200).json({ ...lesson, completed, prev, next });
    },

    postLessonCompleted: (req, res) => {
      if (!req.session) throw new RouteError('Unauthorized', 401);
      try {
        const { courseId, lessonId } = {
          courseId: v.number(req.body.courseId),
          lessonId: v.number(req.body.lessonId),
        };
        const writeResult = this.query.insertLessonCompleted(
          req.session.user_id,
          courseId,
          lessonId
        );
        if (writeResult.changes === 0) {
          throw new RouteError('Lesson already completed', 400);
        }

        const progress = this.query.selectProgress(
          req.session.user_id,
          courseId
        );
        const incompleteLessons = progress.filter((item) => !item.completed);
        if (progress.length > 0 && incompleteLessons.length === 0) {
          const certificate = this.query.insertCertificate(
            req.session.user_id,
            courseId
          );
          if (!certificate) {
            throw new RouteError('Error generating certificate', 400);
          }
          res.status(201).json({ certificate: certificate?.id ?? null });
          return;
        }

        res.status(201).json({ certificate: null, title: 'Lesson completed' });
      } catch (error) {
        res.status(400).json({ title: 'Lesson not found' });
      }
    },

    resetCourse: (req, res) => {
      if (!req.session) throw new RouteError('Unauthorized', 401);
      const { courseId } = {
        courseId: v.number(req.body.courseId),
      };
      const deleteResult = this.query.deleteLessonCompleted(
        req.session.user_id,
        courseId
      );
      if (deleteResult.changes === 0) {
        throw new RouteError('Error resetting course', 400);
      }
      res.status(200).json({ title: 'Course reset' });
    },

    getCertificates: (req, res) => {
      if (!req.session) throw new RouteError('Unauthorized', 401);
      const certificates = this.query.selectCertificates(req.session.user_id);
      if (certificates.length === 0) {
        throw new RouteError('No certificates found', 404);
      }
      res.status(200).json(certificates);
    },

    getCertificate: (req, res) => {
      const { id } = req.params;
      const certificate = this.query.selectCertificate(id);
      if (!certificate) {
        throw new RouteError('Certificate not found', 404);
      }
      res.status(200).json(certificate);
    },
  } satisfies Api['handlers'];

  table(): void {
    this.db.exec(lmsTables);
  }

  routes(): void {
    // Courses
    this.router.post('/lms/course', this.handlers.postCourse, [
      this.auth.guard('admin'),
    ]);
    this.router.get('/lms/courses', this.handlers.getCourses);
    this.router.get('/lms/course/:slug', this.handlers.getCourse, [
      this.auth.optional,
    ]);
    this.router.put('/lms/course/:slug', this.handlers.putCourse, [
      this.auth.guard('admin'),
    ]);
    this.router.delete('/lms/course/reset', this.handlers.resetCourse, [
      this.auth.guard('user'),
    ]);

    // Lessons
    this.router.get('/lms/lessons', this.handlers.getLessons, [
      this.auth.guard('admin'),
    ]);
    this.router.post('/lms/lesson', this.handlers.postLesson, [
      this.auth.guard('admin'),
    ]);
    this.router.put('/lms/lesson/:id', this.handlers.putLesson, [
      this.auth.guard('admin'),
    ]);
    this.router.get(
      '/lms/lesson/:courseSlug/:lessonSlug',
      this.handlers.getLesson
    ),
      [this.auth.optional];
    this.router.post(
      '/lms/lesson/completed',
      this.handlers.postLessonCompleted,
      [this.auth.guard('user')]
    );

    //certificates
    this.router.get('/lms/certificates', this.handlers.getCertificates, [
      this.auth.guard('user'),
    ]);
    this.router.get('/lms/certificate/:id', this.handlers.getCertificate);
  }
}
