import { Api } from "../../core/utils/abstract.ts";
import { lmsTables } from "./tables.ts";
import { RouteError } from "../../core/utils/route-error.ts";

export class LmsApi extends Api {

    handlers = {
        postCourses: (req, res) => {
            const { slug, title, description, lessons, hours } = req.body;
            const writeResult = this.db.query(/* sql */ `
                INSERT OR IGNORE INTO courses 
                ("slug", "title", "description", "lessons", "hours") VALUES (?, ?, ?, ?, ?);
            `).run(slug, title, description, lessons, hours);
            if (writeResult.changes === 0) {
                throw new RouteError('Course already exists', 400);
            }
            res.status(201).json({ id: writeResult.lastInsertRowid, title: "Created course" });
        },
        
        postLessons: (req, res) => {
            const { courseSlug, slug, title, seconds, video, description, order, free } = req.body;

            const writeResult = this.db.query(/* sql */ `
                INSERT OR IGNORE INTO lessons 
                ("course_id", "slug", "title", "seconds", "video", "description", "order", "free" )
                 VALUES ((SELECT "id" FROM "courses" WHERE "slug" = ?), ?, ?, ?, ?, ?, ?, ?);
            `).run(courseSlug, slug, title, seconds, video, description, order, free);

            if (writeResult.changes === 0) {
                throw new RouteError('Lesson already exists', 400);
            }
            res.status(201).json({ id: writeResult.lastInsertRowid, title: "Created lesson" });
        }
    } satisfies Api['handlers']

    table(): void {
        this.db.exec(lmsTables);
    }

    routes(): void {

        this.router.post('/lms/courses', this.handlers.postCourses);
        this.router.post('/lms/lessons', this.handlers.postLessons);
    }
}