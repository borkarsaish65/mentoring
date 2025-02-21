'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId

		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		// Insert data into the report_queries table
		await queryInterface.bulkInsert('report_queries', [
			{
				report_code: 'total_number_of_sessions_attended',
				query: `SELECT 
                COUNT(*) AS total_count,
            CASE 
                WHEN 'All' = 'All' THEN 
                    COUNT(*) FILTER (WHERE Session.type = 'PUBLIC') -- Count for Public sessions
                ELSE NULL 
            END AS public_count,
            CASE 
                WHEN 'All' = 'All' THEN 
                    COUNT(*) FILTER (WHERE Session.type = 'PRIVATE') -- Count for Private sessions
                ELSE NULL 
            END AS private_count
            FROM 
                public.session_attendees AS sa
            JOIN 
                public.sessions AS Session
            ON 
                sa.session_id = Session.id
            WHERE 
                (CASE WHEN :userId IS NOT NULL THEN sa.mentee_id = :userId ELSE TRUE END)
                AND sa.joined_at IS NOT NULL
                AND (CASE WHEN :start_date IS NOT NULL THEN Session.start_date > :start_date ELSE TRUE END)
                AND (CASE WHEN :end_date IS NOT NULL THEN Session.end_date < :end_date ELSE TRUE END)
                AND (
                    CASE 
                        WHEN :session_type = 'All' THEN Session.type IN ('PUBLIC', 'PRIVATE')
                        WHEN :session_type = 'Public' THEN Session.type = 'PUBLIC'
                        WHEN :session_type = 'Private' THEN Session.type = 'PRIVATE'
                        ELSE TRUE
                    END
                );`,
				organization_id: defaultOrgId,
				status: 'ACTIVE',
				created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
				updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			{
				report_code: 'total_hours_of_learning',
				query: `SELECT 
                TO_CHAR(
    INTERVAL '1 hour' * FLOOR(SUM(
        CASE WHEN Session.type IN ('PUBLIC', 'PRIVATE') THEN EXTRACT(EPOCH FROM (Session.completed_at - Session.started_at)) ELSE 0 END
    ) / 3600) +
    INTERVAL '1 minute' * FLOOR(SUM(
        CASE WHEN Session.type IN ('PUBLIC', 'PRIVATE') THEN EXTRACT(EPOCH FROM (Session.completed_at - Session.started_at)) ELSE 0 END
    ) / 60 % 60) +
    INTERVAL '1 second' * FLOOR(SUM(
        CASE WHEN Session.type IN ('PUBLIC', 'PRIVATE') THEN EXTRACT(EPOCH FROM (Session.completed_at - Session.started_at)) ELSE 0 END
    ) % 60),
    'HH24:MI:SS'
) AS total_hours
, -- Total duration of all sessions
            TO_CHAR(
                INTERVAL '1 hour' * FLOOR(SUM(CASE WHEN Session.type = 'PUBLIC' THEN EXTRACT(EPOCH FROM (Session.completed_at - Session.started_at)) / 3600 ELSE 0 END)) +
                INTERVAL '1 minute' * FLOOR(SUM(CASE WHEN Session.type = 'PUBLIC' THEN EXTRACT(EPOCH FROM (Session.completed_at - Session.started_at)) / 60 ELSE 0 END) % 60) +
                INTERVAL '1 second' * FLOOR(SUM(CASE WHEN Session.type = 'PUBLIC' THEN EXTRACT(EPOCH FROM (Session.completed_at - Session.started_at)) % 60 ELSE 0 END)),
                'HH24:MI:SS'
            ) AS public_hours, -- Total duration of public sessions
            TO_CHAR(
                INTERVAL '1 hour' * FLOOR(SUM(CASE WHEN Session.type = 'PRIVATE' THEN EXTRACT(EPOCH FROM (Session.completed_at - Session.started_at)) / 3600 ELSE 0 END)) +
                INTERVAL '1 minute' * FLOOR(SUM(CASE WHEN Session.type = 'PRIVATE' THEN EXTRACT(EPOCH FROM (Session.completed_at - Session.started_at)) / 60 ELSE 0 END) % 60) +
                INTERVAL '1 second' * FLOOR(SUM(CASE WHEN Session.type = 'PRIVATE' THEN EXTRACT(EPOCH FROM (Session.completed_at - Session.started_at)) % 60 ELSE 0 END)),
                'HH24:MI:SS'
            ) AS private_hours
            FROM 
                public.session_attendees AS sa
            JOIN 
                public.sessions AS Session
            ON 
                sa.session_id = Session.id
            WHERE 
                (CASE WHEN :userId IS NOT NULL THEN sa.mentee_id = :userId ELSE TRUE END)
                AND sa.joined_at IS NOT NULL 
                AND (CASE WHEN :start_date IS NOT NULL THEN Session.start_date > :start_date ELSE TRUE END)
                AND (CASE WHEN :end_date IS NOT NULL THEN Session.end_date < :end_date ELSE TRUE END)
                AND (
                    CASE 
                        WHEN :session_type = 'All' THEN Session.type IN ('PUBLIC', 'PRIVATE')
                        WHEN :session_type = 'Public' THEN Session.type = 'PUBLIC'
                        WHEN :session_type = 'Private' THEN Session.type = 'PRIVATE'
                        ELSE TRUE
                    END
                );`,
				organization_id: defaultOrgId,
				status: 'ACTIVE',
				created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
				updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			{
				report_code: 'split_of_sessions_enrolled_and_attended_by_user',
				query: `SELECT 
                :start_date AS startDate,
                :end_date AS endDate,
                -- Enrolled session counts
            COUNT(
        CASE 
            WHEN (sa.type = 'ENROLLED' OR sa.type = 'INVITED')
                AND Session.type = 'PUBLIC' 
                AND (:session_type = 'All' OR :session_type = 'Public') 
            THEN 1 
        END
    ) AS public_session_enrolled,

    -- Private session enrolled count
    COUNT(
        CASE 
            WHEN (sa.type = 'ENROLLED' OR sa.type = 'INVITED')
                AND Session.type = 'PRIVATE' 
                AND (:session_type = 'All' OR :session_type = 'Private') 
            THEN 1 
        END
    ) AS private_session_enrolled,

    -- Public session attended count
    COUNT(
        CASE 
            WHEN sa.joined_at IS NOT NULL 
                AND Session.type = 'PUBLIC' 
                AND (:session_type = 'All' OR :session_type = 'Public') 
            THEN 1 
        END
    ) AS public_session_attended,

    -- Private session attended count
    COUNT(
        CASE 
            WHEN sa.joined_at IS NOT NULL 
                AND Session.type = 'PRIVATE' 
                AND (:session_type = 'All' OR :session_type = 'Private') 
            THEN 1 
        END
    ) AS private_session_attended
            FROM public.session_attendees AS sa
            JOIN public.sessions AS Session
            ON sa.session_id = Session.id
            WHERE 
            (CASE WHEN :userId IS NOT NULL THEN sa.mentee_id = :userId ELSE TRUE END)
            AND (CASE WHEN :start_date IS NOT NULL THEN Session.start_date > :start_date ELSE TRUE END)
            AND (CASE WHEN :end_date IS NOT NULL THEN Session.end_date < :end_date ELSE TRUE END);`,
				organization_id: defaultOrgId,
				status: 'ACTIVE',
				created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
				updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			{
				report_code: 'mentee_session_details',
				query: `SELECT
                Session.title AS "sessions_title",
                ue.name AS "sessions_created_by",
                Session.mentor_name AS "mentor_name",
                TO_TIMESTAMP(Session.start_date)::DATE AS "date_of_session",
                Session.type AS "session_type",
                ARRAY_TO_STRING(Session.categories, ', ') AS "categories",
                ARRAY_TO_STRING(Session.recommended_for, ', ') AS "recommended_for",
                CASE
                    WHEN sa.joined_at IS NOT NULL THEN 'Yes'
                    ELSE 'No'
                END AS "session_attended",
                ROUND(EXTRACT(EPOCH FROM (TO_TIMESTAMP(Session.end_date) - TO_TIMESTAMP(Session.start_date))) / 60) AS "duration_of_sessions_attended_in_minutes"
            FROM (
                SELECT *
                FROM public.sessions
            ) AS Session -- Alias defined in the subquery
            LEFT JOIN -- Moved this JOIN before the JOIN with session_attendees
                public.user_extensions AS ue
                ON Session.created_by = ue.user_id
            JOIN  -- This JOIN is now after the LEFT JOIN
                public.session_attendees AS sa
                ON sa.session_id = Session.id    
            WHERE
                -- Filter by mentee ID if provided
                (:userId IS NULL OR sa.mentee_id = :userId)
            
                -- Filter by start date if provided
                AND (:start_date IS NULL OR Session.start_date > :start_date)
            
                -- Filter by end date if provided
                AND (:end_date IS NULL OR Session.end_date < :end_date)
            
                -- Filter by session type
                AND (
                    :session_type = 'All' AND Session.type IN ('PUBLIC', 'PRIVATE')
                    OR :session_type = 'PUBLIC' AND Session.type = 'PUBLIC'
                    OR :session_type = 'PRIVATE' AND Session.type = 'PRIVATE'
                );`,
				organization_id: defaultOrgId,
				status: 'ACTIVE',
				created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
				updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			{
				report_code: 'total_number_of_sessions_conducted',
				query: `SELECT
                COUNT(*) AS total_count,
                COUNT(CASE WHEN Session.type = 'PUBLIC' AND ('All' = 'All' OR 'All' = 'PUBLIC') THEN 1 END) AS public_count,
                COUNT(CASE WHEN Session.type = 'PRIVATE' AND ('All' = 'All' OR 'All' = 'PRIVATE') THEN 1 END) AS private_count
            FROM (
                SELECT
                    s.id,
                    s.type
                FROM
                    public.sessions AS s
                WHERE
                    s.status = 'COMPLETED'
                    AND s.start_date > :start_date
                    AND s.end_date < :end_date
                    AND (
                        CASE
                            WHEN :session_type = 'All' THEN s.type IN ('PUBLIC', 'PRIVATE')
                            WHEN :session_type = 'PUBLIC' THEN s.type = 'PUBLIC'
                            WHEN :session_type = 'PRIVATE' THEN s.type = 'PRIVATE'
                            ELSE TRUE
                        END
                    )
            ) AS Session
            JOIN
                public.session_ownerships AS so ON so.session_id = Session.id
            WHERE
                so.user_id = :userId
                AND ('MENTOR' IS NULL OR so.type = 'MENTOR');`,
				organization_id: defaultOrgId,
				status: 'ACTIVE',
				created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
				updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			{
				report_code: 'total_hours_of_mentoring_conducted',
				query: `WITH filtered_ownerships AS (
                    SELECT 
                        so.session_id
                    FROM 
                        public.session_ownerships so
                    WHERE 
                        so.user_id = :userId 
                        AND so.type = 'MENTOR'
 -- Filter based on the user_id
                )
                SELECT 
                    -- Total duration (sum of both public and private sessions)
                    COALESCE(
                        TO_CHAR(
                            INTERVAL '1 hour' * FLOOR(SUM(
                                CASE WHEN s.type IN ('PUBLIC', 'PRIVATE') THEN EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) ELSE 0 END
                            ) / 3600) +
                            INTERVAL '1 minute' * FLOOR(SUM(
                                CASE WHEN s.type IN ('PUBLIC', 'PRIVATE') THEN EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) ELSE 0 END
                            ) / 60 % 60) +
                            INTERVAL '1 second' * FLOOR(SUM(
                                CASE WHEN s.type IN ('PUBLIC', 'PRIVATE') THEN EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) ELSE 0 END
                            ) % 60),
                            'HH24:MI:SS'
                        ), 
                        '00:00:00'
                    ) AS total_hours,
                
                    -- Duration for public sessions
                    COALESCE(
                        TO_CHAR(
                            INTERVAL '1 hour' * FLOOR(SUM(
                                CASE WHEN s.type = 'PUBLIC' THEN EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) ELSE 0 END
                            ) / 3600) +
                            INTERVAL '1 minute' * FLOOR(SUM(
                                CASE WHEN s.type = 'PUBLIC' THEN EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) ELSE 0 END
                            ) / 60 % 60) +
                            INTERVAL '1 second' * FLOOR(SUM(
                                CASE WHEN s.type = 'PUBLIC' THEN EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) ELSE 0 END
                            ) % 60),
                            'HH24:MI:SS'
                        ), 
                        '00:00:00'
                    ) AS public_hours,
                
                    -- Duration for private sessions
                    COALESCE(
                        TO_CHAR(
                            INTERVAL '1 hour' * FLOOR(SUM(
                                CASE WHEN s.type = 'PRIVATE' THEN EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) ELSE 0 END
                            ) / 3600) +
                            INTERVAL '1 minute' * FLOOR(SUM(
                                CASE WHEN s.type = 'PRIVATE' THEN EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) ELSE 0 END
                            ) / 60 % 60) +
                            INTERVAL '1 second' * FLOOR(SUM(
                                CASE WHEN s.type = 'PRIVATE' THEN EXTRACT(EPOCH FROM (s.completed_at - s.started_at)) ELSE 0 END
                            ) % 60),
                            'HH24:MI:SS'
                        ), 
                        '00:00:00'
                    ) AS private_hours
                FROM 
                    filtered_ownerships fo
                JOIN 
                    public.sessions s ON s.id = fo.session_id  -- Join with the sessions table based on session_id
                WHERE 
                    s.status = 'COMPLETED'
                    AND s.start_date > :start_date  -- Start date filter
                    AND s.end_date < :end_date    -- End date filter
                    AND (
                        CASE 
                            WHEN :session_type = 'All' THEN s.type IN ('PUBLIC', 'PRIVATE')  -- If all types, include both
                            WHEN :session_type = 'PUBLIC' THEN s.type = 'PUBLIC'  -- If PUBLIC, only include public
                            WHEN :session_type = 'PRIVATE' THEN s.type = 'PRIVATE'  -- If PRIVATE, only include private
                            ELSE TRUE  -- Default condition
                        END
                    );`,
				organization_id: defaultOrgId,
				status: 'ACTIVE',
				created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
				updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			{
				report_code: 'split_of_sessions_conducted',
				query: `SELECT
                :start_date AS startDate,
                :end_date AS endDate,
            
                -- Total sessions created
                COUNT(DISTINCT CASE
                    WHEN (
                        (so.type = 'CREATOR' OR so.type = 'MENTOR')
                        AND (
                            'All' = 'All'
                            OR (:session_type = 'PUBLIC' AND s.type = 'PUBLIC')
                            OR (:session_type = 'PRIVATE' AND s.type = 'PRIVATE')
                        )
                        AND (
                            (s.created_by!= :userId AND s.mentor_id = :userId)
                            OR (s.created_by = :userId AND s.mentor_id = :userId)
                        )
                    )
                    THEN s.id
                END) AS total_sessions_created,
            
                -- PUBLIC sessions created
                COUNT(DISTINCT CASE
                    WHEN (
                        (so.type = 'CREATOR' OR so.type = 'MENTOR')
                        AND s.type = 'PUBLIC'
                        AND (:session_type = 'All' OR :session_type = 'PUBLIC')
                        AND (
                            (s.created_by!= :userId AND s.mentor_id = :userId)
                            OR (s.created_by = :userId AND s.mentor_id = :userId)
                        )
                    )
                    THEN s.id
                END) AS public_sessions_created,
            
                -- PRIVATE sessions created
                COUNT(DISTINCT CASE
                    WHEN (
                        (so.type = 'CREATOR' OR so.type = 'MENTOR')
                        AND s.type = 'PRIVATE'
                        AND (:session_type = 'All' OR :session_type = 'PRIVATE')
                        AND (
                            (s.created_by!= :userId AND s.mentor_id = :userId)
                            OR (s.created_by = :userId AND s.mentor_id = :userId)
                        )
                    )
                    THEN s.id
                END) AS private_sessions_created,
            
                -- Total sessions conducted
                COUNT(DISTINCT CASE
                    WHEN (
                        so.type = 'MENTOR'
                        AND s.status = 'COMPLETED'
                        AND (
                            :session_type = 'All'
                            OR (:session_type = 'PUBLIC' AND s.type = 'PUBLIC')
                            OR (:session_type = 'PRIVATE' AND s.type = 'PRIVATE')
                        )
                    )
                    THEN s.id
                END) AS total_sessions_conducted,
            
                -- PUBLIC sessions conducted
                COUNT(DISTINCT CASE
                    WHEN (
                        so.type = 'MENTOR'
                        AND s.status = 'COMPLETED'
                        AND s.type = 'PUBLIC'
                        AND (:session_type = 'All' OR :session_type = 'PUBLIC')
                    )
                    THEN s.id
                END) AS public_sessions_conducted,
            
                -- PRIVATE sessions conducted
                COUNT(DISTINCT CASE
                    WHEN (
                        so.type = 'MENTOR'
                        AND s.status = 'COMPLETED'
                        AND s.type = 'PRIVATE'
                        AND (:session_type = 'All' OR :session_type = 'PRIVATE')
                    )
                    THEN s.id
                END) AS private_sessions_conducted
            
            FROM (
                SELECT
                    id,
                    type,
                    created_by,
                    mentor_id,
                    status
                FROM
                    public.sessions
                WHERE
                    (start_date > :start_date OR :start_date IS NULL)
                    AND (end_date < :end_date OR :end_date IS NULL)
            ) AS s
            JOIN
                public.session_ownerships AS so ON so.session_id = s.id
            WHERE
                (:userId IS NOT NULL AND so.user_id = :userId OR :userId IS NULL);`,
				organization_id: defaultOrgId,
				status: 'ACTIVE',
				created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
				updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			{
				report_code: 'mentoring_session_details',
				query: `SELECT
                s.title AS "sessions_title",
                ue.name AS "sessions_created_by",
                s.seats_limit - s.seats_remaining AS "number_of_mentees",
                TO_TIMESTAMP(s.start_date)::DATE AS "date_of_session",
                s.type AS "session_type",
                CASE WHEN s.started_at IS NOT NULL THEN 'Yes' ELSE 'No' END AS "session_conducted",
                ROUND(EXTRACT(EPOCH FROM (TO_TIMESTAMP(s.end_date) - TO_TIMESTAMP(s.start_date))) / 60) AS "duration_of_sessions_attended_in_minutes"
            FROM
                (SELECT * FROM public.sessions WHERE start_date > :start_date AND end_date < :end_date) AS s
            JOIN
                (SELECT * FROM public.session_ownerships WHERE user_id = :userId AND type = 'MENTOR') AS so ON s.id = so.session_id
            LEFT JOIN
                public.user_extensions AS ue ON s.created_by = ue.user_id
            WHERE
                (
                    CASE
                        WHEN :session_type = 'All' THEN s.type IN ('PUBLIC', 'PRIVATE')
                        WHEN :session_type = 'PUBLIC' THEN s.type = 'PUBLIC'
                        WHEN :session_type = 'PRIVATE' THEN s.type = 'PRIVATE'
                        ELSE TRUE
                    END
                )`,
				organization_id: defaultOrgId,
				status: 'ACTIVE',
				created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
				updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			{
				report_code: 'total_hours_of_sessions_created_by_session_manager',
				query: `SELECT
                TO_CHAR(
                    INTERVAL '1 hour' * FLOOR(SUM(EXTRACT(EPOCH FROM (TO_TIMESTAMP(s.end_date) - TO_TIMESTAMP(s.start_date))) / 60) / 60) +
                    INTERVAL '1 minute' * FLOOR(SUM(EXTRACT(EPOCH FROM (TO_TIMESTAMP(s.end_date) - TO_TIMESTAMP(s.start_date))) / 60) % 60) +
                    INTERVAL '1 second' * FLOOR(SUM(EXTRACT(EPOCH FROM (TO_TIMESTAMP(s.end_date) - TO_TIMESTAMP(s.start_date))) / 60) % 60),
                    'HH24:MI:SS'
                ) AS total_hours,
            
                TO_CHAR(
                    INTERVAL '1 hour' * FLOOR(SUM(CASE WHEN s.type = 'PUBLIC' THEN EXTRACT(EPOCH FROM (TO_TIMESTAMP(s.end_date) - TO_TIMESTAMP(s.start_date))) / 60 ELSE 0 END) / 60) +
                    INTERVAL '1 minute' * FLOOR(SUM(CASE WHEN s.type = 'PUBLIC' THEN EXTRACT(EPOCH FROM (TO_TIMESTAMP(s.end_date) - TO_TIMESTAMP(s.start_date))) / 60 ELSE 0 END) % 60) +
                    INTERVAL '1 second' * FLOOR(SUM(CASE WHEN s.type = 'PUBLIC' THEN EXTRACT(EPOCH FROM (TO_TIMESTAMP(s.end_date) - TO_TIMESTAMP(s.start_date))) / 60 ELSE 0 END) % 60),
                    'HH24:MI:SS'
                ) AS total_public_hours,
            
                TO_CHAR(
                    INTERVAL '1 hour' * FLOOR(SUM(CASE WHEN s.type = 'PRIVATE' THEN EXTRACT(EPOCH FROM (TO_TIMESTAMP(s.end_date) - TO_TIMESTAMP(s.start_date))) / 60 ELSE 0 END) / 60) +
                    INTERVAL '1 minute' * FLOOR(SUM(CASE WHEN s.type = 'PRIVATE' THEN EXTRACT(EPOCH FROM (TO_TIMESTAMP(s.end_date) - TO_TIMESTAMP(s.start_date))) / 60 ELSE 0 END) % 60) +
                    INTERVAL '1 second' * FLOOR(SUM(CASE WHEN s.type = 'PRIVATE' THEN EXTRACT(EPOCH FROM (TO_TIMESTAMP(s.end_date) - TO_TIMESTAMP(s.start_date))) / 60 ELSE 0 END) % 60),
                    'HH24:MI:SS'
                ) AS total_private_hours
            
            FROM
                (SELECT id, type, start_date, end_date FROM public.sessions WHERE start_date > :start_date AND end_date < :end_date) AS s
            JOIN
                (SELECT session_id FROM public.session_ownerships WHERE user_id = :userId AND type = 'CREATOR') AS so ON s.id = so.session_id
            WHERE
                (
                    CASE
                        WHEN :session_type = 'All' THEN s.type IN ('PUBLIC', 'PRIVATE')
                        WHEN :session_type = 'PUBLIC' THEN s.type = 'PUBLIC'
                        WHEN :session_type = 'PRIVATE' THEN s.type = 'PRIVATE'
                        ELSE TRUE
                    END
                );`,
				organization_id: defaultOrgId,
				status: 'ACTIVE',
				created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
				updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			{
				report_code: 'total_number_of_hours_of_mentoring_conducted',
				query: `SELECT
                TO_CHAR(
                    INTERVAL '1 hour' * FLOOR(SUM(EXTRACT(EPOCH FROM (completed_at - started_at)) / 3600)) +
                    INTERVAL '1 minute' * FLOOR(SUM(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60) % 60) +
                    INTERVAL '1 second' * FLOOR(SUM(EXTRACT(EPOCH FROM (completed_at - started_at)) % 60)),
                    'HH24:MI:SS'
                ) AS total_hours,
            
                TO_CHAR(
                    INTERVAL '1 hour' * FLOOR(SUM(CASE WHEN s.type = 'PUBLIC' THEN EXTRACT(EPOCH FROM (completed_at - started_at)) ELSE 0 END) / 3600) +
                    INTERVAL '1 minute' * FLOOR(SUM(CASE WHEN s.type = 'PUBLIC' THEN EXTRACT(EPOCH FROM (completed_at - started_at)) ELSE 0 END) / 60 % 60) +
                    INTERVAL '1 second' * FLOOR(SUM(CASE WHEN s.type = 'PUBLIC' THEN EXTRACT(EPOCH FROM (completed_at - started_at)) ELSE 0 END) % 60),
                    'HH24:MI:SS'
                ) AS public_hours,
            
                TO_CHAR(
                    INTERVAL '1 hour' * FLOOR(SUM(CASE WHEN s.type = 'PRIVATE' THEN EXTRACT(EPOCH FROM (completed_at - started_at)) ELSE 0 END) / 3600) +
                    INTERVAL '1 minute' * FLOOR(SUM(CASE WHEN s.type = 'PRIVATE' THEN EXTRACT(EPOCH FROM (completed_at - started_at)) ELSE 0 END) / 60 % 60) +
                    INTERVAL '1 second' * FLOOR(SUM(CASE WHEN s.type = 'PRIVATE' THEN EXTRACT(EPOCH FROM (completed_at - started_at)) ELSE 0 END) % 60),
                    'HH24:MI:SS'
                ) AS private_hours
            
            FROM
                (SELECT id, type, start_date, end_date, completed_at, started_at FROM public.sessions WHERE status = 'COMPLETED' AND start_date > :start_date AND end_date < :end_date) AS s
            JOIN
                (SELECT session_id FROM public.session_ownerships WHERE user_id = :userId AND type = 'MENTOR') AS so ON s.id = so.session_id
            WHERE
                (
                    CASE
                        WHEN :session_type = 'All' THEN s.type IN ('PUBLIC', 'PRIVATE')
                        WHEN :session_type = 'PUBLIC' THEN s.type = 'PUBLIC'
                        WHEN :session_type = 'PRIVATE' THEN s.type = 'PRIVATE'
                        ELSE TRUE
                    END
                );`,
				organization_id: defaultOrgId,
				status: 'ACTIVE',
				created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
				updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			{
				report_code: 'split_of_sessions_created_and_conducted',
				query: `SELECT
                :start_date AS startDate,
                :end_date AS endDate,
            
                -- Count session_created
                COUNT(*) FILTER (
                    WHERE so.type = 'CREATOR'
                    AND (
                        :session_type = 'All'
                        OR (:session_type = 'Public' AND s.type = 'PUBLIC')
                        OR (:session_type = 'Private' AND s.type = 'PRIVATE')
                    )
                ) AS total_session_created,
            
                -- Total sessions conducted (all types combined)
                COUNT(*) FILTER (
                    WHERE so.type = 'MENTOR'
                    AND s.status = 'COMPLETED'
                    AND (
                        :session_type = 'All'
                        OR :session_type = 'Public' AND s.type = 'PUBLIC'
                        OR :session_type = 'Private' AND s.type = 'PRIVATE'
                    )
                ) AS total_sessions_conducted,
            
                -- Public sessions conducted
                COUNT(*) FILTER (
                    WHERE so.type = 'MENTOR'
                    AND s.status = 'COMPLETED'
                    AND :session_type IN ('All', 'Public')
                    AND s.type = 'PUBLIC'
                ) AS public_sessions_conducted,
            
                -- Private sessions conducted
                COUNT(*) FILTER (
                    WHERE so.type = 'MENTOR'
                    AND s.status = 'COMPLETED'
                    AND :session_type IN ('All', 'Private')
                    AND s.type = 'PRIVATE'
                ) AS private_sessions_conducted,
            
                -- Public sessions created
                COUNT(*) FILTER (
                    WHERE so.type = 'CREATOR'
                    AND :session_type IN ('All', 'Public')
                    AND s.type = 'PUBLIC'
                ) AS public_sessions_created,
            
                -- Private sessions created
                COUNT(*) FILTER (
                    WHERE so.type = 'CREATOR'
                    AND :session_type IN ('All', 'Private')
                    AND s.type = 'PRIVATE'
                ) AS private_sessions_created
            
            FROM
                (SELECT id, type, status FROM public.sessions WHERE (start_date > :start_date OR :start_date IS NULL) AND (end_date < :end_date OR :end_date IS NULL)) AS s
            JOIN
                (SELECT session_id, type FROM public.session_ownerships WHERE (:userId IS NOT NULL AND user_id = :userId OR :userId IS NULL) AND type IN ('CREATOR', 'MENTOR')) AS so ON s.id = so.session_id
            WHERE
                (
                    :session_type = 'All'
                    OR :session_type = 'Public'
                    OR :session_type = 'Private'
                );`,
				organization_id: defaultOrgId,
				status: 'ACTIVE',
				created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
				updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			{
				report_code: 'session_manger_session_details',
				query: `SELECT
                subquery."mentor_name" ,
                subquery."number_of_mentoring_sessions",
                subquery."hours_of_mentoring_sessions",
                subquery."avg_mentor_rating"
            FROM (
                SELECT
                    Session.mentor_name AS "mentor_name",
                    COUNT(*) OVER (PARTITION BY so.user_id) AS "number_of_mentoring_sessions",
                    CASE
                        WHEN
                            ROUND(SUM(EXTRACT(EPOCH FROM (Session.completed_at - Session.started_at))) / 3600.0) = FLOOR(SUM(EXTRACT(EPOCH FROM (Session.completed_at - Session.started_at))) / 3600.0)
                        THEN
                            CAST(FLOOR(SUM(EXTRACT(EPOCH FROM (Session.completed_at - Session.started_at))) / 3600.0) AS TEXT)
                        ELSE
                            CAST(ROUND(SUM(EXTRACT(EPOCH FROM (Session.completed_at - Session.started_at))) / 3600.0, 1) AS TEXT)
                    END AS "hours_of_mentoring_sessions",
                    COALESCE(CAST(ue.rating ->> 'average' AS NUMERIC), 0) AS "avg_mentor_rating"
                FROM
                    (SELECT * FROM public.sessions WHERE created_by = :userId AND started_at IS NOT NULL AND completed_at IS NOT NULL AND start_date > :start_date AND end_date < :end_date AND (
                        CASE
                            WHEN :session_type = 'All' THEN type IN ('PUBLIC', 'PRIVATE')
                            WHEN :session_type = 'PUBLIC' THEN type = 'PUBLIC'
                            WHEN :session_type = 'PRIVATE' THEN type = 'PRIVATE'
                            ELSE TRUE
                        END
                    )) AS Session
                JOIN
                    (SELECT * FROM public.session_ownerships WHERE type = 'MENTOR') AS so ON Session.id = so.session_id
                LEFT JOIN
                    public.user_extensions AS ue ON so.user_id = ue.user_id
                GROUP BY
                    so.user_id,
                    Session.created_by,
                    Session.mentor_name,
                    COALESCE(CAST(ue.rating ->> 'average' AS NUMERIC), 0)
            ) AS subquery 
            ;`,
				organization_id: defaultOrgId,
				status: 'ACTIVE',
				created_at: Sequelize.literal('CURRENT_TIMESTAMP'),
				updated_at: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
		])
	},

	async down(queryInterface, Sequelize) {
		// Revert the inserted data
		await queryInterface.bulkDelete('report_queries', { report_code: 'session_created' })
	},
}
