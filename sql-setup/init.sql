-- TODO: Generated only id,created_at,updated_at
-- TODO: datatype for first_name,last_name
-- TODO: datatype for uri
-- TODO: Replace sha256(random()::text::bytea) md5(random()::text)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

CREATE OR REPLACE FUNCTION trigger_updated_timestamp()
RETURNS TRIGGER AS $$
BEGIN
	IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN
		NEW.updated_at = now();
		RETURN NEW;
	ELSE
		RETURN OLD;
	END IF;
END;
$$ language 'plpgsql';

-- TODO: Check if needed
CREATE OR REPLACE FUNCTION trigger_lowercase_email()
RETURNS TRIGGER AS $$
BEGIN
	NEW.email = LOWER(NEW.email);
	RETURN NEW;
END;
$$ language 'plpgsql';

-- https://html.spec.whatwg.org/multipage/input.html#e-mail-state-(type=email)
DO $$ BEGIN
		CREATE DOMAIN email AS citext
			CHECK ( value ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' );
	EXCEPTION
		WHEN duplicate_object THEN null;
END $$;


-- Users table

-- TODO: is_active, prevent delete
-- TODO: username validation
CREATE TABLE users (
	id        	character(36)	UNIQUE	NOT NULL	DEFAULT uuid_generate_v4()           	PRIMARY KEY                                                   ,
	created_at	timestamptz  	      	NOT NULL	DEFAULT current_timestamp            	                                                              ,
	updated_at	timestamptz  	      	NOT NULL	DEFAULT current_timestamp            	                                                              ,
	avatar    	text         	      	        	                                     	                                                              ,
	bio       	text         	      	        	                                     	                                                              ,
	birth_date	date         	      	NOT NULL	                                     	                                                              ,
	email     	email        	UNIQUE	NOT NULL	                                     	                                                              ,
	first_name	text         	      	NOT NULL	                                     	                                                              ,
	last_name 	text         	      	NOT NULL	                                     	                                                              ,
	username  	citext       	UNIQUE	NOT NULL	                                     	CONSTRAINT username_minlength CHECK (char_length(username)>=2)
);

CREATE TRIGGER trigger_users_updated_timestamp
	BEFORE UPDATE
	ON users
	FOR EACH ROW
	EXECUTE PROCEDURE trigger_updated_timestamp();

CREATE TRIGGER trigger_users_lowercase_email
	BEFORE INSERT OR UPDATE
	ON users
	FOR EACH ROW
	EXECUTE PROCEDURE trigger_lowercase_email();


-- Users_extra table

CREATE TABLE users_extra (
	user_id 	character(36)	UNIQUE	NOT NULL	                                     	PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
	password	text         	      	NOT NULL	DEFAULT sha256(random()::text::bytea)
);


-- Logins table

CREATE TABLE logins (
	id        	character(36)	UNIQUE	NOT NULL	DEFAULT uuid_generate_v4()           	PRIMARY KEY                            ,
	created_at	timestamptz  	      	NOT NULL	DEFAULT current_timestamp            	                                       ,
	updated_at	timestamptz  	      	NOT NULL	DEFAULT current_timestamp            	                                       ,
	user_id   	character(36)	      	NOT NULL	                                     	REFERENCES users (id) ON DELETE CASCADE,
	token     	text         	UNIQUE	NOT NULL	DEFAULT sha256(random()::text::bytea)	                                       ,
	expires_at	timestamptz  	      	NOT NULL
);

CREATE TRIGGER trigger_logins_updated_timestamp
	BEFORE UPDATE
	ON logins
	FOR EACH ROW
	EXECUTE PROCEDURE trigger_updated_timestamp();


-- Groups table

DO $$ BEGIN
		CREATE TYPE group_type AS ENUM (
			'public',
			'private-link',
			'private'
		);
	EXCEPTION
		WHEN duplicate_object THEN null;
END $$;

CREATE TABLE groups (
    id         	character(36)	UNIQUE	NOT NULL	DEFAULT uuid_generate_v4()	PRIMARY KEY,
    title      	text         	      	NOT NULL	                          	           ,
    created_at 	timestamptz  	      	NOT NULL	DEFAULT current_timestamp 	           ,
    updated_at 	timestamptz  	      	NOT NULL	DEFAULT current_timestamp 	           ,
    avatar     	text         	      	        	                          	           ,
    bio        	text         	      	        	                          	           ,
    group_type 	group_type   	      	NOT NULL	DEFAULT 'private'         	           ,
    is_archived	boolean      	      	NOT NULL	DEFAULT false
);

CREATE TRIGGER trigger_groups_updated_timestamp
	BEFORE UPDATE
	ON groups
	FOR EACH ROW
	EXECUTE PROCEDURE trigger_updated_timestamp();


-- Group Members table

DO $$ BEGIN
		CREATE TYPE member_type AS ENUM (
			'member',
			'admin'
		);
	EXCEPTION
		WHEN duplicate_object THEN null;
END $$;

-- TODO: Atleast one admin constraint
CREATE TABLE group_members (
	created_at 	timestamptz  		NOT NULL	DEFAULT current_timestamp	                                        ,
	updated_at 	timestamptz  		NOT NULL	DEFAULT current_timestamp	                                        ,
	group_id   	character(36)		NOT NULL	                         	REFERENCES groups (id) ON DELETE CASCADE,
	user_id    	character(36)		NOT NULL	                         	REFERENCES users (id) ON DELETE CASCADE ,
	member_type	member_type  		NOT NULL	DEFAULT 'member'         	                                        ,

	PRIMARY KEY (group_id,user_id)
);

CREATE TRIGGER trigger_group_members_updated_timestamp
	BEFORE UPDATE
	ON group_members
	FOR EACH ROW
	EXECUTE PROCEDURE trigger_updated_timestamp();


-- Books table

CREATE TABLE books (
	id         	character(36)	UNIQUE	NOT NULL	DEFAULT uuid_generate_v4()	PRIMARY KEY                             ,
	title      	text         	      	NOT NULL	                          	                                        ,
	created_at 	timestamptz  	      	NOT NULL	DEFAULT current_timestamp 	                                        ,
	updated_at 	timestamptz  	      	NOT NULL	DEFAULT current_timestamp 	                                        ,
	author_name	text         	      	        	                          	                                        ,
	description	text         	      	        	                          	                                        ,
	file       	text         	      	NOT NULL	                          	                                        ,
	group_id   	character(36)	      	NOT NULL	                          	REFERENCES groups (id) ON DELETE CASCADE,
	isbn       	text         	      	        	                          	                                        ,
	thumbnail  	text         	      	NOT NULL
);

CREATE TRIGGER trigger_books_updated_timestamp
	BEFORE UPDATE
	ON books
	FOR EACH ROW
	EXECUTE PROCEDURE trigger_updated_timestamp();


-- Comments table

DO $$ BEGIN
		CREATE TYPE comment_type AS ENUM (
			'comment',
			'highlight',
			'note',
			'question',
			'reply'
		);
	EXCEPTION
		WHEN duplicate_object THEN null;
END $$;

-- TODO: prevent id==reply_to_id, circular reply chains
CREATE TABLE comments (
	id            	character(36)	UNIQUE	NOT NULL	DEFAULT uuid_generate_v4()	PRIMARY KEY                               ,
	created_at    	timestamptz  	      	NOT NULL	DEFAULT current_timestamp 	                                          ,
	updated_at    	timestamptz  	      	NOT NULL	DEFAULT current_timestamp 	                                          ,
	body          	text         	      	        	                          	                                          ,
	book_id       	character(36)	      	NOT NULL	                          	REFERENCES books (id) ON DELETE CASCADE   ,
	comment_type  	comment_type 	      	NOT NULL	DEFAULT 'note'            	                                          ,
	hashtags      	text         	      	        	                          	                                          ,
	hidden        	boolean      	      	NOT NULL	DEFAULT false             	                                          ,
	reply_to_id   	character(36)	      	        	                          	REFERENCES comments (id) ON DELETE CASCADE,
	selection_data	text         	      	        	                          	                                          ,
	user_id       	character(36)	      	NOT NULL	                          	REFERENCES users (id) ON DELETE CASCADE
);

CREATE TRIGGER trigger_comments_updated_timestamp
	BEFORE UPDATE
	ON comments
	FOR EACH ROW
	EXECUTE PROCEDURE trigger_updated_timestamp();


-- TODO: Check view performance

-- Users view

CREATE VIEW users_view AS
	SELECT
		u.*,
		Jsonb_agg(m.*) AS group_members
		FROM users u
		LEFT JOIN group_members m ON u.id = m.user_id
		GROUP BY u.id;

-- Groups view

-- TODO: Improve performance from 3 to 2 joins
CREATE VIEW groups_view AS
	WITH
	s1 AS(
		SELECT
			g.id,
			Jsonb_agg(m.*) AS group_members
			FROM groups g
			LEFT JOIN group_members m ON g.id = m.group_id
			GROUP BY g.id
	),
	s2 AS(
		SELECT
			g.id,
			array_remove(array_agg(b.id),NULL) AS book_ids
			FROM groups g
			LEFT JOIN books b on g.id = b.group_id
			GROUP BY g.id
	)
	SELECT
		g.*,
		s1.group_members,
		s2.book_ids
	FROM groups g,s1,s2
	WHERE g.id=s1.id AND s1.id = s2.id;


-- Books view

CREATE VIEW books_view AS
	SELECT
		b.*,
		array_remove(array_agg(c.id),NULL) AS comment_ids
		FROM books b
		LEFT JOIN comments c ON b.id = c.book_id
		GROUP BY b.id;


-- Comments view

CREATE VIEW comments_view AS
	SELECT
		c.*,
		array_remove(array_agg(c2.id),NULL) AS reply_ids
		FROM comments c
		LEFT JOIN comments c2 ON c.id = c2.reply_to_id
		GROUP BY c.id;
