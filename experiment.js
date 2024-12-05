let SEED = "666";
Nof1.SET_SEED(SEED);

function generateComplexBackslashTask() {
    function createAnnoyingString(length) {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const backslashSequences = ["\\n", "\\t", "\\\\", "\\b", "\\r"];
        let result = [];

        for (let i = 0; i < length; i++) {
            if (Math.random() < 0.3) {
                result.push(backslashSequences[Math.floor(Math.random() * backslashSequences.length)]);
            } else if (Math.random() < 0.2) {
                result.push("\\");
            } else {
                result.push(chars.charAt(Math.floor(Math.random() * chars.length)));
            }
        }

        return result.join("");
    }

    const stringLength = Math.floor(Math.random() * 51) + 50; // Random length between 50 and 100
    const annoyingString = createAnnoyingString(stringLength);
    const correctCount = (annoyingString.match(/\\/g) || []).length; // Count backslashes

    return { task: annoyingString, solution: correctCount };
}

function applyColorToTask(taskString) {
    return taskString.replace(/\\/g, '<span style="color: red;">\\</span>');
}

let experiment_configuration_function = (writer) => {
    return {
        experiment_name: "NicksExperiment",
        seed: SEED,
        introduction_pages: writer.stage_string_pages_commands([
            writer.convert_string_to_html_string(
                "Objective:\n" +
                "Participants are tasked with counting all the backslashes (\\\\) in a randomly generated string.\n" +
                "This includes standalone backslashes and those that appear as part of escape sequences (e.g., \\n, \\t, \\\\\\).\n" +
                "\n" +
                "Task Instructions:\n" +
                "1. You will be presented with a string in one of two formats:\n" +
                "   - Plain text.\n" +
                "   - Text where backslashes are highlighted in color.\n" +
                "2. Your task is to carefully count all backslashes in the string, including those in escape sequences.\n"+
                "3. If you dont know the answear you can skip the task by entering 'n' \n"
            )
        ]),
        pre_run_training_instructions: writer.string_page_command(
            writer.convert_string_to_html_string(
                "- Example Task:\n" +
                "- Given the string: a\\\\nbcd\\\\e\\\\\\\\fghijk\\\\tlmno\\\\r\\\\pq\\\\rs\\\\tuvw\\\\xy\\\\z\\\\n1234\\\\5\n" +
                "- Breakdown of backslashes:\n" +
                "  - \\\\\ → 2 backslashes\n" +
                "  - \\n → 1 backslash\n" +
                "  - \\ → 1 backslash\n" +
                "  - \\\\\ → 2 backslashes\n" +
                "  - \\t → 1 backslash\n" +
                "- Total: 15 backslashes"
            )
        ),
        pre_run_experiment_instructions: writer.string_page_command(
            writer.convert_string_to_html_string("You entered the experiment phase.\n\n")
        ),
        post_questionnaire: [
            Nof1.free_text("Name","What's your name?"),
            Nof1.free_text("Age","How old are you?"),
            Nof1.alternatives("Status","What is your current working status?",
                ["Undergraduate student (BSc not yet finished)", "Graduate student (at least BSc finished)", "PhD student", "Professional software developer", "Teacher", "Other"]),
            Nof1.free_text("Feedback","Feedback"),
        ],
        finish_pages: [
            writer.string_page_command(
                writer.convert_string_to_html_string("Thanks for the fish.")
            )
        ],

        layout: [
            { variable: "Appearance", treatments: ["plain", "colored"] } // Add "plain" and "colored" treatments
        ],
        repetitions: 10, // Repeat the experiment for each treatment
        measurement: Nof1.Time_to_finish(Nof1.text_input_experiment),
        task_configuration: (t) => {
            const task = generateComplexBackslashTask(); // Generate a new task for each repetition
            t.do_print_task = () => {
                writer.clear_stage();
                const appearance = t.treatment_value("Appearance");

                // Display the task
                if (appearance === "colored") {
                    writer.print_html_on_stage(applyColorToTask(task.task));
                } else {
                    writer.print_html_on_stage(task.task);
                }
                writer.print_html_on_stage(
                    "<p>If you dont know the answear you can skip this task by entering <strong>'n'</strong>.</p>"
                );
            };
            t.expected_answer = task.solution;
            t.accepts_answer_function = (given_answer) => {
                if (given_answer === "n") {
                    t.expected_answer = "skipped";
                    return true;
                }
                return parseInt(given_answer) === task.solution;
            };

            t.do_print_error_message = (given_answer) => {
                writer.clear_error();
                writer.print_html_on_error(
                    `<h1>Invalid answer: ${given_answer}.`
                );
            };
            t.do_print_after_task_information = () => {
                writer.clear_error();
                writer.print_string_on_stage(
                    writer.convert_string_to_html_string(
                        "Correct.\n\n" +
                        "If you feel not concentrated enough, take a short break.\n\n" +
                        "Press [Enter] to continue."
                    )
                );
            };
        }
    };
};

Nof1.BROWSER_EXPERIMENT(experiment_configuration_function);
