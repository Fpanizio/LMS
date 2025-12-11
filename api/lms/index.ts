import { Api } from "../../core/utils/abstract.ts";
import { lmsTables } from "./tables.ts";
import { RouteError } from "../../core/utils/route-error.ts";
import { LmsQuery } from "./query.ts";

export class LmsApi extends Api {

    query = new LmsQuery(this.db);

    handlers = {
        postCourse: (req, res) => {
            const { slug, title, description, lessons, hours } = req.body;
            const writeResult = this.query.insertCourse({ slug, title, description, lessons, hours });
            if (writeResult.changes === 0) {
                throw new RouteError('Course already exists', 400);
            }
            res.status(201).json({ id: writeResult.lastInsertRowid, title: "Created course" });
        },

        postLesson: (req, res) => {
            const { courseSlug, slug, title, seconds, video, description, order, free } = req.body;

            const writeResult = this.query.insertLesson({ courseSlug, slug, title, seconds, video, description, order, free });

            if (writeResult.changes === 0) {
                throw new RouteError('Lesson already exists', 400);
            }
            res.status(201).json({ id: writeResult.lastInsertRowid, title: "Created lesson" });
        },

        getCourses: (req, res) => {
            const courses = this.query.selectCourses();
            if (courses.length === 0) {
                throw new RouteError('No courses found', 404);
            }
            res.status(200).json(courses);
        },

        getCourse: (req, res) => {
            const { slug } = req.params;
            const course = this.query.selectCourseBySlug(slug);
            const lessons = this.query.selectLessonsBySlug(slug);
            if (!course) {
                throw new RouteError('Course not found', 404);
            }
            res.status(200).json({ course, lessons });
        },

        getLesson: (req, res) => {
            const { courseSlug, lessonSlug } = req.params;
            const lesson = this.query.selectLesson(courseSlug, lessonSlug);
            const nav = this.query.selectLessonNav(courseSlug, lessonSlug);
            if (!lesson) {
                throw new RouteError('Lesson not found', 404);
            }

            const i = nav.findIndex(item => item.slug === lesson.slug);
            const prev = i === 0 ? null : nav.at(i - 1)?.slug;
            const next = nav.at(i + 1)?.slug ?? null;
            res.status(200).json({ ...lesson, prev, next });
        },

        postLessonCompleted: (req, res) => {
            try {

                const userId = 1;
                const { courseId, lessonId } = req.body;
                const writeResult = this.query.insertLessonCompleted(userId, courseId, lessonId);
                if (writeResult.changes === 0) {
                    throw new RouteError('Lesson already completed', 400);
                }
                res.status(201).json({ title: "Lesson completed" });
            } catch (error) {
                res.status(400).json({ title: "Lesson not found" });
            }
        }
    } satisfies Api['handlers']

    table(): void {
        this.db.exec(lmsTables);
    }

    routes(): void {

        // Courses
        this.router.post('/lms/course', this.handlers.postCourse);
        this.router.get('/lms/courses', this.handlers.getCourses);
        this.router.get('/lms/course/:slug', this.handlers.getCourse);

        // Lessons
        this.router.post('/lms/lesson', this.handlers.postLesson);
        this.router.get('/lms/lesson/:courseSlug/:lessonSlug', this.handlers.getLesson);

        // Lessons Completed 
        this.router.post('/lms/lesson/completed', this.handlers.postLessonCompleted);
    }
}