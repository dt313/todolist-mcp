import ChatBox from "@/components/chat";
import TodoList from "@/components/todolist";
import { TodoProvider } from "@/context/todo.context";

export default function Home() {
  return (
    <TodoProvider>
      <div className="flex min-h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black p-4 md:items-center">
        <main
          className="
    flex w-full max-w-[1240px] items-start justify-between bg-transparent dark:bg-black gap-8
    flex-col-reverse 
    md:flex-row
  "
        >
          {/* Chat Component */}
          <section className="flex-1 w-full">
            <ChatBox />
          </section>

          <section className="flex-1 w-full">
            <TodoList />
          </section>
        </main>
      </div>
    </TodoProvider>
  );
}
